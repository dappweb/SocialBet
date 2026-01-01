# Changelog

All notable changes to Soulcast will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3] - 2025-01-27

### Added
- **SOUL Token Trading System**
  - Buy SOUL tokens with fiat (Web3Auth Wallet Services integration)
  - Buy SOUL tokens with ETH
  - Sell SOUL tokens for fiat or crypto
  - Real-time price calculation ($0.05 USD per SOUL)
  - Trade validation (min $10, max $100,000)

- **Treasury Management**
  - Operational fund dashboard
  - Revenue tracking and statistics
  - Fund allocation breakdown (40% Dev, 30% Ops, 15% Marketing, 10% Reserves, 5% Partnerships)
  - Platform fee collection (2.5% on all trades)

- **Deployment Management**
  - Monthly production deployment policy
  - Deployment scripts for production and staging
  - Deployment log tracking
  - Release versioning system

- **Sepolia Testnet Configuration**
  - Complete Sepolia testnet setup
  - Environment-based chain configuration
  - Deployment scripts for Sepolia

- **Profile Picture Enhancements**
  - Multi-provider profile image support (profileImage, picture, avatar_url)
  - Profile picture display in Sidebar, Profile page, and Feed
  - Fallback avatar generation

### Changed
- Updated Web3Auth context to support environment-based chain configuration
- Default chain changed to Sepolia testnet
- Enhanced RightPanel with SOUL token trading CTA

### Technical
- Created token trading service (`services/tokenTrading.ts`)
- Created treasury management component
- Added deployment documentation
- Updated hardhat config for multiple testnets

### Documentation
- Added SOUL token trading feature documentation
- Created deployment schedule and policy documentation
- Added Sepolia testnet setup guide
- Created execution plan document

---

## [1.2.2] - Previous Release

### Added
- Web3Auth integration with social logins
- Profile picture display
- Performance optimizations

---

## [1.2.1] - Previous Release

### Added
- White paper page
- DAO governance component
- Basic authentication

---

## [1.2.0] - Previous Release

### Added
- Core prediction market features
- Feed, Explore, Leaderboard components
- Basic UI/UX

---

## [1.0.0] - Initial Release

### Added
- Initial project setup
- Basic components
- Design system

---

[1.2.3]: https://github.com/your-repo/soulcast/releases/tag/v1.2.3
[1.2.2]: https://github.com/your-repo/soulcast/releases/tag/v1.2.2
[1.2.1]: https://github.com/your-repo/soulcast/releases/tag/v1.2.1
[1.2.0]: https://github.com/your-repo/soulcast/releases/tag/v1.2.0
[1.0.0]: https://github.com/your-repo/soulcast/releases/tag/v1.0.0

