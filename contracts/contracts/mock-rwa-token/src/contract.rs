use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String};
use stellar_access::access_control::{self as access_control, AccessControl};
use stellar_macros::{default_impl, only_role};
use stellar_tokens::fungible::{
    allowlist::{AllowList, FungibleAllowList},
    burnable::FungibleBurnable,
    Base, FungibleToken,
};

#[contract]
pub struct MockRwaToken;

#[contractimpl]
impl MockRwaToken {
    pub fn __constructor(e: &Env, admin: Address, manager: Address, initial_supply: i128) {
        // Set token metadata
        Base::set_metadata(
            e,
            18,  // Higher precision for RWA valuations
            String::from_str(e, "Real World Asset Token"),
            String::from_str(e, "RWA"),
        );

        // Set up access control
        access_control::set_admin(e, &admin);

        // Grant manager role for whitelist management
        access_control::grant_role_no_auth(
            e,
            &admin,
            &manager,
            &symbol_short!("manager")
        );

        // Auto-whitelist the admin so they can receive initial supply
        AllowList::allow_user(e, &admin);

        // Mint initial supply to admin
        Base::mint(e, &admin, initial_supply);
    }

    /// Public mint function for hackathon/demo purposes
    /// Allows anyone to mint mock RWA tokens for testing
    /// Auto-whitelists the user if not already whitelisted
    pub fn mint_rwa_tokens(e: Env, to: Address, amount: i128) {
        // Require authorization from the recipient
        to.require_auth();

        // Validate amount
        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // Maximum mint per transaction: 1,000,000 tokens (1M * 10^18)
        let max_mint = 1_000_000_000_000_000_000_000_000i128;
        if amount > max_mint {
            panic!("Amount exceeds maximum mint limit");
        }

        // Auto-whitelist user if not already whitelisted
        if !AllowList::allowed(&e, &to) {
            AllowList::allow_user(&e, &to);
        }

        // Mint tokens
        Base::mint(&e, &to, amount);

        // Emit event
        e.events().publish(
            (symbol_short!("mock_mint"), to.clone()),
            amount
        );
    }
}

// Use OpenZeppelin's AllowList implementation for transfer restrictions
#[default_impl]
#[contractimpl]
impl FungibleToken for MockRwaToken {
    type ContractType = AllowList;  // This enforces whitelist on transfers
}

// Whitelist management functions
#[contractimpl]
impl FungibleAllowList for MockRwaToken {
    fn allowed(e: &Env, account: Address) -> bool {
        AllowList::allowed(e, &account)
    }

    #[only_role(operator, "manager")]
    fn allow_user(e: &Env, user: Address, operator: Address) {
        AllowList::allow_user(e, &user)
    }

    #[only_role(operator, "manager")]
    fn disallow_user(e: &Env, user: Address, operator: Address) {
        AllowList::disallow_user(e, &user)
    }
}

// Access control for admin operations
#[default_impl]
#[contractimpl]
impl AccessControl for MockRwaToken {}

// Burnable tokens
#[default_impl]
#[contractimpl]
impl FungibleBurnable for MockRwaToken {}
