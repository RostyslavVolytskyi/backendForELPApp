module.exports = {
    "database": process.env.DB_PATH || "mongodb://localhost:27017/eatlikepro",
    "port": process.env.PORT || 9999,
    "secretKey": process.env.SECRET_KEY || "YourSecretKey",

    "ELPmail": process.env.GMAIL || "",
    "ELPpass": process.env.GMAIL_PATH || "",
    "adminMails": process.env.ADMIN_MAILS || "eatlikeprofessional@gmail.com, vitaliy.chornyy.dev@gmail.com"
}
