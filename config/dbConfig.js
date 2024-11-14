import mongoose from "mongoose";

export const connectToMongoDb = () => {
  try {
    const connect = mongoose.connect(
      process.env.DB_CONNECT_URL + "Elprs-database"
    );
    if (connect) {
      console.log(`Database connected at Elms-database successfully!!!`);
    }
  } catch (error) {
    console.log("Error:", error);
  }
};
