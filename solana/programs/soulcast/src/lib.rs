use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, Burn, MintTo};

declare_id!("SoulCastTokenProgramID111111111111111111111111");

#[program]
pub mod soulcast {
    use super::*;

    /// Initialize SOUL Token Mint
    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let mint_authority = &ctx.accounts.mint_authority;
        
        // Mint authority is set to the program's PDA
        // This allows the program to mint tokens
        msg!("SOUL Token Mint initialized");
        Ok(())
    }

    /// Mint SOUL Tokens
    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let seeds = &[
            b"mint_authority",
            &[ctx.bumps.mint_authority],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, amount)?;

        msg!("Minted {} SOUL tokens to {}", amount, ctx.accounts.to.key());
        Ok(())
    }

    /// Initialize Staking State
    pub fn initialize_staking(ctx: Context<InitializeStaking>, reward_rate_bps: u64) -> Result<()> {
        let state = &mut ctx.accounts.staking_state;
        state.authority = ctx.accounts.authority.key();
        state.reward_rate_bps = reward_rate_bps;
        state.total_staked = 0;
        state.total_issuance_fee_burned = 0;
        msg!("Staking initialized with reward rate: {} bps", reward_rate_bps);
        Ok(())
    }

    /// Stake Tokens
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        // Transfer tokens from user to staking vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.staking_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update User Stake Info
        let user_stake = &mut ctx.accounts.user_stake;
        user_stake.amount += amount;
        user_stake.staked_at = Clock::get()?.unix_timestamp;
        user_stake.last_reward_claim = Clock::get()?.unix_timestamp;
        
        // Update Global State
        let state = &mut ctx.accounts.staking_state;
        state.total_staked += amount;

        msg!("Staked {} SOUL tokens", amount);
        Ok(())
    }

    /// Unstake Tokens
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount >= amount, ErrorCode::InsufficientStake);

        // Calculate and claim rewards first
        let rewards = calculate_rewards(user_stake, &ctx.accounts.staking_state)?;
        if rewards > 0 {
            // Mint rewards to user
            let seeds = &[
                b"mint_authority",
                &[ctx.bumps.mint_authority],
            ];
            let signer = &[&seeds[..]];

            let mint_cpi_accounts = MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            };
            let mint_cpi_program = ctx.accounts.token_program.to_account_info();
            let mint_cpi_ctx = CpiContext::new_with_signer(mint_cpi_program, mint_cpi_accounts, signer);
            token::mint_to(mint_cpi_ctx, rewards)?;
        }

        // Update User Stake Info
        user_stake.amount -= amount;
        user_stake.last_reward_claim = Clock::get()?.unix_timestamp;

        // Update Global State
        let state = &mut ctx.accounts.staking_state;
        state.total_staked -= amount;

        // Transfer tokens back to user from vault
        let bump = ctx.bumps.staking_vault;
        let seeds = &[b"staking_vault".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.staking_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        msg!("Unstaked {} SOUL tokens, claimed {} rewards", amount, rewards);
        Ok(())
    }

    /// Claim Staking Rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount > 0, ErrorCode::NoStake);

        let rewards = calculate_rewards(user_stake, &ctx.accounts.staking_state)?;
        require!(rewards > 0, ErrorCode::NoRewards);

        // Mint rewards to user
        let seeds = &[
            b"mint_authority",
            &[ctx.bumps.mint_authority],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, rewards)?;

        user_stake.last_reward_claim = Clock::get()?.unix_timestamp;

        msg!("Claimed {} SOUL rewards", rewards);
        Ok(())
    }

    /// Transfer with Issuance Fee Burn
    pub fn transfer_with_fee(
        ctx: Context<TransferWithFee>, 
        amount: u64,
        fee_bps: u64
    ) -> Result<()> {
        // Calculate fee
        let fee = (amount * fee_bps) / 10000;
        let net_amount = amount - fee;

        // Burn Fee
        if fee > 0 {
            let burn_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.from.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            );
            token::burn(burn_ctx, fee)?;
            
            // Update burned amount in state
            let state = &mut ctx.accounts.staking_state;
            state.total_issuance_fee_burned += fee;
        }

        // Transfer Net Amount
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, net_amount)?;

        msg!("Transferred {} SOUL, burned {} as fee", net_amount, fee);
        Ok(())
    }

    /// Calculate rewards for a user
    fn calculate_rewards(user_stake: &Account<UserStake>, state: &Account<StakingState>) -> Result<u64> {
        if user_stake.amount == 0 {
            return Ok(0);
        }

        let duration = Clock::get()?.unix_timestamp - user_stake.last_reward_claim;
        if duration <= 0 {
            return Ok(0);
        }

        // Annual reward = staked * rate / 10000
        // Per second reward = annual / (365 * 24 * 3600)
        let annual_reward = (user_stake.amount as u128)
            .checked_mul(state.reward_rate_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        
        let rewards = (annual_reward as u128)
            .checked_mul(duration as u128)
            .unwrap()
            .checked_div(365 * 24 * 3600)
            .unwrap();

        Ok(rewards as u64)
    }
}

// ============ Accounts ============

#[account]
pub struct StakingState {
    pub authority: Pubkey,
    pub reward_rate_bps: u64,
    pub total_staked: u64,
    pub total_issuance_fee_burned: u64,
}

#[account]
pub struct UserStake {
    pub amount: u64,
    pub staked_at: i64,
    pub last_reward_claim: i64,
}

// ============ Contexts ============

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeStaking<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8)]
    pub staking_state: Account<'info, StakingState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub staking_state: Account<'info, StakingState>,
    #[account(
        init_if_needed, 
        payer = user, 
        space = 8 + 8 + 8 + 8,
        seeds = [b"user_stake", user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"staking_vault"],
        bump
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub staking_state: Account<'info, StakingState>,
    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"staking_vault"],
        bump
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub staking_state: Account<'info, StakingState>,
    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferWithFee<'info> {
    #[account(mut)]
    pub staking_state: Account<'info, StakingState>,
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

// ============ Errors ============

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient stake balance.")]
    InsufficientStake,
    #[msg("No stake found.")]
    NoStake,
    #[msg("No rewards available.")]
    NoRewards,
}
