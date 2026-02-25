import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';

async function init() {  
    const app = express();
    const PORT = Number(process.env.PORT) || 8000;

    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String
                say(name: String!): String
            }
        `,
        resolvers: {
            Query: {
                hello: () => 'Hey there',
                say: (_, {name}: {name: String} ) => `Hey ${name}`,
            },
        },
        plugins: [ ApolloServerPluginLandingPageLocalDefault() ],
    });

    await gqlServer.start();

    app.get('/', (req, res) => {
        res.json({ message: 'Server Running' });
    });

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(gqlServer)
    );

    app.listen(PORT, '0.0.0.0', () => console.log(`Server Running at PORT:${PORT}`));
};

init();