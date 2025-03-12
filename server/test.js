const bcrypt = require("bcrypt");

const password = "Athena123!";
const storedHash =
  "$2b$10$Achjr1aPjtYgcuk4MjThcew6YVJ.Oz8XA3O4IuUy1BDlg2GRQlVnW"; // From DB

bcrypt.compare(password, storedHash, (err, result) => {
  console.log("Manual bcrypt test result:", result);
});
