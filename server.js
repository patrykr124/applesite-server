const {PrismaClient} = require("@prisma/client");
const express = require("express");
const cors = require("cors");
const app = express();
const prisma = new PrismaClient();
app.use(express.static('public'));
const stripe = require('stripe')('sk_test_51P1xNFG6QaMKi8sIagIrhGQupNAgvWSCRgtBUWCuS9wbjVjZDKskTPNwoUVLWaPCwh92S8uxgf1GYhCQzhOp8shP007BhoXZiW');
app.use(express.json());

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://applesite-server.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
};

app.use(cors(corsOptions));

app.get('/', async (req, res) => {
    res.send('server is running')
})

//all

app.get("/category", async (req, res) => {
    try {
        const categories = await prisma.product.findMany();
        res.json(categories);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.get("/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

//only iphone

app.get("/products/iphone", async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                slug: "iphone",
            },
        });
        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

//only macbook

app.get("/products/macbook", async (req, res) => {
    try {
        const category = await prisma.product.findMany({
            where: {
                slug: "macbook",
            },
        });
        res.json(category);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// pojedyńczy produkt

app.get("/products/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const product = await prisma.product.findUnique({
            where: {
                id: id,
            },
        });
        res.json(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});


// STRIPE


app.post('/create-checkout-session', async (req, res) => {
    const YOUR_DOMAIN = 'http://localhost:5173/';

    try {
        const {items} = req.body;

        const line_items = items.map(item => ({
            price_data: {
                currency: 'pln',
                product_data: {
                    name: item.title,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,

        }));



        const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: `${YOUR_DOMAIN}/?success=true`,
                cancel_url: `${YOUR_DOMAIN}`,
            }
        )
        res.json({url: session.url});


    } catch (err) {
        console.error("Błąd podczas tworzenia sesji:", err);
        res.status(500).json({error: "Nie udało się utworzyć sesji płatności"});
    }

});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
