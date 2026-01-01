use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("SoulCastTokenProgramID111111111111111111111111");

#[program]
pub mod soulcast {
    use super::*;

    /// Initialize Staking State
    pub fn initialize_staking(ctx: Context<InitializeStaking>, reward_rate_bps: u64) -> Result<()> {
        let state = &mut ctx.accounts.staking_state;
        state.authority = ctx.accounts.authority.key();
        state.reward_rate_bps = reward_rate_bps;
        state.total_staked = 0;
        state.total_issuance_fee_burned = 0;
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
        
        // Update Global State
        let state = &mut ctx.accounts.staking_state;
        state.total_staked += amount;

        Ok(())
    }

    /// Unstake Tokens
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount >= amount, ErrorCode::InsufficientStake);

        // Update User Stake Info
        user_stake.amount -= amount;

        // Update Global State
        let state = &mut ctx.accounts.staking_state;
        state.total_staked -= amount;

        // Transfer tokens back to user
        // Note: Needs PDA signer for vault transfer
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

        Ok(())
    }

    /// Transfer with Issuance Fee Burn
    /// This wraps a normal SPL transfer but burns a fee
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
                token::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.from.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            );
            token::burn(burn_ctx, fee)?;
            
            // Track total burned in state (if initialized)
            // Note: This would require passing the state account, simplified here
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

        Ok(())
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
}

// ============ Contexts ============

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
        space = 8 + 8 + 8,
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
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferWithFee<'info> {
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
}
