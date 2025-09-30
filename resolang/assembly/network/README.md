# Prime Resonance Network - Identity & Domain System

## Overview

The Prime Resonance Network (PRN) Identity and Domain System provides enterprise-class identity management with support for both self-sovereign and centrally-controlled identity schemes. The system features hierarchical domains, capability-based permissions, and seamless integration with the quantum-inspired prime resonance computational layer.

## Architecture

### Core Components

1. **Identity System**
   - Self-sovereign identities (user-controlled)
   - Managed identities (organization-controlled)
   - System identities (network services)
   - Progressive KYC verification levels
   - Prime resonance mapping for quantum computation

2. **Domain System**
   - Hierarchical domain structure
   - Nested subdomain support
   - Domain ownership and membership
   - Domain-scoped objects and permissions

3. **Object System**
   - Fungible objects (tokens, currencies)
   - Non-fungible objects (unique assets)
   - Transferable and non-transferable properties
   - Destructible objects with lifecycle management

4. **Permission System**
   - Role-Based Access Control (RBAC)
   - Capability-based permissions
   - Domain-scoped permissions
   - Permission inheritance

## Getting Started

### 1. Initialize the Gateway Client

```typescript
import { GatewayClient } from "./gateway-client";
import { Identity } from "../identity/identity";
import { IdentityCreationParams } from "../identity/types";
import { IdentityType, KYCLevel } from "../identity/interfaces";

// Create identity parameters
const params = new IdentityCreationParams();
params.type = "self_sovereign";
params.kycLevel = KYCLevel.NONE;
params.metadata = new Map<string, string>();
params.metadata.set("name", "Alice");

// Create identity
const identity = new Identity(params);

// Create gateway client
const gateway = new GatewayClient("gateway-001");

// Connect to network with prime resonance values
const connected = gateway.connect(
  identity,
  7919,  // Gaussian prime
  11,    // Eisenstein prime  
  13     // Quaternionic prime
);
```

### 2. Create and Manage Identities

```typescript
// Create a managed identity
const newIdentity = gateway.createIdentity(
  IdentityType.MANAGED,
  new Map<string, string>([
    ["name", "Bob"],
    ["email", "bob@example.com"]
  ])
);

// Update KYC level (requires appropriate permissions)
identity.setKYCLevel(KYCLevel.BASIC);
```

### 3. Work with Domains

```typescript
// Create a root domain
const domainRequest = gateway.createDomain("example.prn");

// Create a subdomain
const subdomainRequest = gateway.createDomain(
  "app.example.prn",
  "example.prn"  // parent domain
);

// Add members to domain
const addMemberRequest = gateway.addDomainMember(
  "example.prn",
  "identity-123"
);
```

### 4. Create Domain Objects

```typescript
// Create a fungible token
const tokenRequest = gateway.createObject(
  "example.prn",
  "MyToken",
  true,   // isFungible
  true,   // isTransferable
  false,  // isDestructible
  new Map<string, string>([
    ["symbol", "MTK"],
    ["totalSupply", "1000000"]
  ])
);

// Create a non-fungible asset
const nftRequest = gateway.createObject(
  "example.prn",
  "UniqueAsset",
  false,  // isFungible
  true,   // isTransferable
  true,   // isDestructible
  new Map<string, string>([
    ["name", "Rare Item #1"],
    ["rarity", "legendary"]
  ])
);
```

### 5. Manage Permissions

```typescript
// Grant permission to another identity
const grantRequest = gateway.grantPermission(
  "identity-456",      // target identity
  "object.create",     // permission
  "example.prn"        // resource (optional)
);

// Revoke permission
const revokeRequest = gateway.revokePermission(
  "identity-456",
  "object.create",
  "example.prn"
);
```

## Genesis Configuration

The network starts with a genesis configuration that defines:
- Initial network nodes and their prime resonance values
- Root identities with system permissions
- Core domains (system, root, public)
- Default permissions and roles

See `genesis.ts` for the complete genesis state.

## Layer 1 Operations

All identity and domain operations are Layer 1 operations that are synchronized across the network:

- `CREATE_IDENTITY` - Create new identity
- `UPDATE_IDENTITY` - Update identity metadata or KYC
- `CREATE_DOMAIN` - Create domain or subdomain
- `UPDATE_DOMAIN` - Update domain properties
- `ADD_DOMAIN_MEMBER` - Add member to domain
- `REMOVE_DOMAIN_MEMBER` - Remove member from domain
- `CREATE_OBJECT` - Create domain object
- `UPDATE_OBJECT` - Update object properties
- `TRANSFER_OBJECT` - Transfer object ownership
- `DESTROY_OBJECT` - Destroy object
- `GRANT_PERMISSION` - Grant permission
- `REVOKE_PERMISSION` - Revoke permission

## Security Model

### Identity Verification
- **Level 0 (NONE)**: No verification required
- **Level 1 (BASIC)**: Email/phone verification
- **Level 2 (ENHANCED)**: Government ID verification
- **Level 3 (FULL)**: Comprehensive background check

### Permission Evaluation
Permissions are evaluated in the following order:
1. Check identity's direct permissions
2. Check identity's role permissions
3. Check domain membership permissions
4. Check parent domain permissions (inheritance)

### Object Ownership
- Objects are owned by identities
- Ownership can be transferred (if object is transferable)
- Objects can be destroyed by owner (if destructible)
- Domain owners have administrative rights over all domain objects

## Best Practices

1. **Identity Management**
   - Use self-sovereign identities for individual users
   - Use managed identities for organizational accounts
   - Implement progressive KYC based on transaction requirements

2. **Domain Structure**
   - Create logical domain hierarchies
   - Use subdomains for applications and services
   - Implement proper access controls at each level

3. **Permission Design**
   - Follow principle of least privilege
   - Create custom roles for common permission sets
   - Use domain-scoped permissions when possible

4. **Object Lifecycle**
   - Define clear ownership rules
   - Implement proper transfer mechanisms
   - Use destructible objects for temporary assets

## Advanced Features

### Prime Resonance Mapping
Each identity is mapped to a unique prime resonance signature, enabling:
- Quantum-inspired computation
- Holographic state distribution
- Entanglement-based consensus

### Multi-Signature Operations
Critical operations can require multiple signatures:
- Identity recovery
- High-value transfers
- Permission changes

### Audit Trail
All state changes are recorded with:
- Timestamp
- Actor identity
- Operation type
- Previous and new values

## Troubleshooting

### Connection Issues
- Verify prime resonance values are valid primes
- Check network connectivity to genesis nodes
- Ensure identity has proper permissions

### Permission Denied
- Check identity's KYC level meets requirements
- Verify domain membership
- Review role assignments

### Transaction Failures
- Ensure sufficient permissions
- Verify object ownership
- Check domain restrictions

## Future Enhancements

- [ ] Decentralized KYC providers
- [ ] Cross-domain permission delegation
- [ ] Smart contract integration
- [ ] Privacy-preserving credentials
- [ ] Quantum-resistant signatures
- [ ] Distributed identity recovery

## Contributing

See the main project README for contribution guidelines.

## License

This project is part of the ResoLang ecosystem and follows the same licensing terms.