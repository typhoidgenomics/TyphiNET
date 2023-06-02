import mongoose from 'mongoose'

let con;

// Connection to MongoDB
const connectDB = async () => {
    try {
        con = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log(`MongoDB connected : ${con.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB