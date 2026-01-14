# Masonko Stokvel - Elected Positions System

## Overview
The system now separates **elected positions** from **members**, allowing positions to be reassigned at any time (e.g., after elections).

## Key Changes

### Before (Old System):
- ❌ Roles were permanently attached to members
- ❌ Couldn't change positions without editing the database
- ❌ Members' roles were fixed in their profile

### After (New System):
- ✅ Positions are separate from members
- ✅ Can be changed anytime through Settings
- ✅ Members retain their identity, positions are flexible

---

## Elected Positions

### 1. **Chairperson**
**Permissions:**
- Approve new members
- Record payments
- Approve payments
- Approve loans
- Create meeting minutes
- Full system access

### 2. **Vice Chairperson**
**Permissions:**
- View all reports
- Limited administrative access

### 3. **Treasurer**
**Permissions:**
- Approve new members
- Record payments
- Approve payments
- Financial reports
- View all financial data

### 4. **Secretary**
**Permissions:**
- Create meeting minutes
- Publish meeting minutes
- Download/share minutes as PDF
- View reports

### 5. **Loan Officer**
**Permissions:**
- Review loan applications
- Approve/reject loans
- View loan reports
- Manage loan repayments

---

## How to Assign/Change Positions

### Step 1: Login as Chairperson
(Or anyone with current chairperson access)

### Step 2: Navigate to Settings
Click "Settings" in the navigation menu

### Step 3: Scroll to "Elected Positions"
You'll see all 5 positions with dropdowns

### Step 4: Select Member for Position
- Click dropdown for the position
- Select member from the list
- Confirm the assignment

### Step 5: Done!
- Member immediately gets new permissions
- Old position holder loses permissions
- Changes take effect instantly

---

## Example Scenarios

### Scenario 1: Annual Elections
```
After AGM on 2026-02-15:
- Assign new Chairperson: Member 6
- Assign new Treasurer: Member 4
- Keep Secretary: Member 9 (re-elected)
- New Loan Officer: Member 7
```

### Scenario 2: Mid-Year Changes
```
Secretary resigns:
1. Go to Settings → Elected Positions
2. Click Secretary dropdown
3. Select new secretary
4. Old secretary loses minutes access
5. New secretary can create minutes immediately
```

### Scenario 3: Temporary Assignment
```
Treasurer on leave:
1. Assign acting treasurer temporarily
2. They get full treasurer permissions
3. When treasurer returns, reassign back
```

---

## Current Assignments (Default)

| Position | Member ID | Member Name | Term |
|----------|-----------|-------------|------|
| Chairperson | 1 | Admin User | 2024-2025 |
| Vice Chairperson | 5 | Member 5 | 2024-2025 |
| Treasurer | 2 | Treasurer User | 2024-2025 |
| Secretary | 9 | Secretary User | 2024-2025 |
| Loan Officer | 3 | Loan Officer User | 2024-2025 |

---

## Login Credentials (For Testing)

**Chairperson:**
- Email: `admin@masonko.com`
- Password: `admin123`

**Treasurer:**
- Email: `treasurer@masonko.com`
- Password: `treasurer123`

**Secretary:**
- Email: `secretary@masonko.com`
- Password: `secretary123`

**Loan Officer:**
- Email: `loanofficer@masonko.com`
- Password: `member123`

---

## Permission Matrix

| Feature | Chairperson | Vice Chair | Treasurer | Secretary | Loan Officer | Member |
|---------|-------------|------------|-----------|-----------|--------------|--------|
| Approve Members | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Record Payments | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Payments | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Loans | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Create Minutes | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Submit Payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apply for Loans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Benefits of New System

1. **Flexible Leadership** - Change positions anytime
2. **Democratic** - Reflects election results immediately
3. **No Database Edits** - Everything done through UI
4. **Term Tracking** - Records when positions were assigned
5. **Clear Permissions** - Each position has defined access
6. **Audit Trail** - Track who held what position when

---

## Technical Notes

### Data Structure:
```javascript
electedPositions: {
    chairperson: { 
        memberId: 1, 
        electedDate: '2024-01-20', 
        term: '2024-2025' 
    },
    treasurer: { 
        memberId: 2, 
        electedDate: '2024-01-20', 
        term: '2024-2025' 
    },
    // etc...
}
```

### Helper Functions:
- `getMemberRoles(memberId)` - Returns array of roles
- `hasPermission(memberId, permission)` - Checks access
- `updatePosition(position, memberId)` - Assigns position

---

## Future Enhancements

- [ ] Add term expiry notifications
- [ ] Election scheduling system
- [ ] Position history/archive
- [ ] Automatic term rotation reminders
- [ ] Multi-position assignments (one person, multiple roles)

---

**Last Updated:** January 2026
**Version:** 2.0 (Elected Positions System)
