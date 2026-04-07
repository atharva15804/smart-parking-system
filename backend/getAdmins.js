const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/smartparking')
.then(async () => {
    try {
        const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, role: String, password: String }, { strict: false }));
        const admins = await User.find({ role: { $in: ['admin', 'checker', 'Admin', 'Checker'] } });
        console.log('=== SYSTEM USERS (ADMIN/CHECKER) ===');
        admins.forEach(a => {
            console.log(`Role: ${a.role} | Name: ${a.name} | Email: ${a.email} | HashPass: (Hidden)`);
            console.log(`To login, use the email above and the password you set. (If you forgot, you can use the register page to create a new admin/checker account or use standard pass like 123456)`);
        });
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
