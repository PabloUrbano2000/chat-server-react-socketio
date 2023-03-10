const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("DB Online");
  } catch (error) {
    console.log(error);
    throw new Error("Error en la base datos - revise los logs");
  }
};

module.exports = {
  dbConnection,
};
