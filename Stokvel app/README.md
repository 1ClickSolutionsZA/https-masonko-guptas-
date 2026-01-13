# Masonko Stokvel-Guptas - Investment Club Management System

A comprehensive web application for managing stokveld/investment clubs with features including member management, contributions tracking, loan applications, and real-time chat.

## Features

### Core Functionality
- ✅ **User Authentication** - Login/Register with role-based access control
- ✅ **Three-Tier Membership** - Tier 1 (R1,000), Tier 2 (R2,000), Tier 3 (R3,000)
- ✅ **Weekly Subscriptions** - Automatic payment tracking with late fees
- ✅ **Member Management** - Admin approval workflow for new members
- ✅ **Contribution Tracking** - Record payments with proof of payment uploads
- ✅ **Loan Applications** - Comprehensive loan form with guarantors
- ✅ **Camera Integration** - Take photos of deposit slips directly from phone
- ✅ **Payment Verification** - Treasurer approval workflow for submitted payments
- ✅ **Financial Reports** - AI-powered insights and analytics
- ✅ **Group Chat** - Real-time messaging between members
- ✅ **Notifications** - Payment reminders and system alerts
- ✅ **Offline Support** - PWA capabilities with IndexedDB storage

### User Roles
- **Admin** - Full system access, member approval
- **Treasurer** - Payment verification, financial reports
- **Vice Chairperson** - Limited administrative access
- **Loan Officer** - Loan application review and approval
- **Members** - View own data, submit payments, apply for loans

## Database Architecture

### Client-Side (IndexedDB)
The app uses IndexedDB for offline-first functionality:
- **users** - Member accounts and authentication
- **contributions** - Payment records with proofs
- **loans** - Loan applications and approvals
- **pendingPayments** - Member-submitted payments awaiting verification
- **notifications** - System notifications
- **chatMessages** - Group chat history
- **settings** - Club configuration

### Server-Side (SQLite/PostgreSQL)
Production deployment uses a Node.js backend with SQLite:
- Secure password hashing with bcrypt
- JWT token authentication
- File upload handling for proof of payments
- API endpoints for all CRUD operations

## Installation & Setup

### Option 1: Client-Only (IndexedDB)

1. **Open the HTML file directly**
   ```bash
   # Simply open stokveld-app.html in a modern browser
   # Chrome, Firefox, Safari, or Edge recommended
   ```

2. **Default Login Credentials**
   - Admin: `admin@masonko.com` / `admin123`
   - Treasurer: `treasurer@masonko.com` / `treasurer123`

3. **Data Storage**
   - All data stored in browser's IndexedDB
   - Persists across sessions
   - Data is device-specific (not synced)

### Option 2: Full Backend Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-key-here-change-this
   NODE_ENV=production
   ```

3. **Start the Server**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

4. **Database Initialization**
   - SQLite database automatically created on first run
   - Default admin and treasurer accounts seeded
   - Located at `./masonko_stokvel.db`

5. **Access the Application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

## API Endpoints

### Authentication
```
POST /api/register      - Register new member (requires approval)
POST /api/login         - Login with email/phone and password
```

### Members
```
GET  /api/members              - Get all approved members (authenticated)
GET  /api/pending-members      - Get pending approvals (admin/treasurer)
POST /api/approve-member/:id   - Approve pending member (admin/treasurer)
```

### Payments
```
POST /api/submit-payment       - Submit payment with proof (authenticated)
GET  /api/pending-payments     - Get pending payments (treasurer/admin)
POST /api/approve-payment/:id  - Approve payment (treasurer/admin)
```

### Loans
```
POST /api/loans     - Submit loan application (authenticated)
GET  /api/loans     - Get loans (own loans or all if admin/loan-officer)
```

## File Upload

### Supported Formats
- **Images**: JPG, PNG, GIF (max 5MB)
- **Documents**: PDF (max 5MB)

### Upload Locations
- Client: Base64 encoded in IndexedDB
- Server: `./uploads/` directory

## Database Schema

### Users Table
```sql
id, name, email, phone, password, role, tier, shares, balance, 
joined, lastPayment, status, approved, createdAt
```

### Contributions Table
```sql
id, memberId, amount, method, reference, proofPath, date, 
recordedBy, status, createdAt
```

### Loans Table
```sql
id, memberId, amount, term, interest, outstanding, nextPayment, 
status, applicationDate, applicationDetails, createdAt
```

### Pending Payments Table
```sql
id, memberId, memberName, amount, method, reference, date, 
notes, proofPath, status, submittedDate, confirmedBy, confirmedDate
```

## Deployment

### Client-Only Deployment
1. Upload `stokveld-app.html` to any web hosting
2. Works with: GitHub Pages, Netlify, Vercel, etc.
3. No server required
4. Each user's data stored locally

### Full Stack Deployment

#### Heroku
```bash
heroku create masonko-stokvel
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```

#### DigitalOcean
```bash
# Use App Platform or Droplet
# Install Node.js and npm
# Clone repository
# Run npm install && npm start
```

#### AWS
- Use Elastic Beanstalk or EC2
- Configure environment variables
- Set up RDS for PostgreSQL (optional)

### Database Migration (SQLite to PostgreSQL)
For production with multiple users, migrate to PostgreSQL:

```bash
npm install pg
# Update server.js to use 'pg' instead of 'sqlite3'
# Update connection string to PostgreSQL URL
```

## Security Considerations

### Production Checklist
- ✅ Change default admin/treasurer passwords
- ✅ Set strong JWT_SECRET in environment variables
- ✅ Enable HTTPS (SSL certificate)
- ✅ Set up CORS properly
- ✅ Implement rate limiting
- ✅ Regular database backups
- ✅ Sanitize file uploads
- ✅ Add input validation
- ✅ Implement session timeout
- ✅ Add audit logging

## Backup & Recovery

### IndexedDB (Client-Side)
```javascript
// Export data
const data = await exportAllData();
downloadJSON(data, 'masonko-backup.json');

// Import data
const data = await readFile();
await importAllData(data);
```

### SQLite (Server-Side)
```bash
# Backup
sqlite3 masonko_stokvel.db ".backup 'backup.db'"

# Restore
sqlite3 masonko_stokvel.db ".restore 'backup.db'"
```

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Mobile (Android 10+) ✅

## Progressive Web App (PWA)

The app can be installed on mobile devices:
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. Access like a native app
4. Works offline

## Support & Maintenance

### Common Issues

**Issue**: Database not initializing
**Solution**: Clear browser cache and reload

**Issue**: Login not working
**Solution**: Check browser console for errors, verify credentials

**Issue**: Photos not uploading
**Solution**: Check browser permissions for camera access

**Issue**: Data not persisting
**Solution**: Ensure IndexedDB is enabled in browser settings

### Performance Tips
- Regular database cleanup (archive old records)
- Compress images before upload
- Limit chat message history
- Use pagination for large member lists

## License
MIT License - Free to use and modify

## Contact
For support: admin@masonko.com

---

**Built with** ❤️ **for Masonko Stokvel-Guptas**
