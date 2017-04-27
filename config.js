module.exports = {
    "database": process.env.DB_PATH || "",
    "port": process.env.PORT || 9999,
    "secretKey": process.env.SECRET_KEY || "",
    
    "ELPmail": process.env.GMAIL || "",
    "ELPpass": process.env.GMAIL_PATH || "",
    "adminMails": process.env.ADMIN_MAILS || ""
}
