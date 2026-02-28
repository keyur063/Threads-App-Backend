import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { prismaClient } from './lib/db';
import { createApolloServer } from './graphql/index';
import UserService from './services/user';

async function init() {  
    const app = express();
    const PORT = Number(process.env.PORT) || 8000;
    const gqlServer = await createApolloServer();

    app.get('/', (req, res) => {
        res.json({ message: 'Server Running' });
    });

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(gqlServer, {
            context: async({ req }) => {
                const token = req.headers['token'];
                try {
                    const user = UserService.decodeJWToken(token as string);
                    return { user };
                } catch(error) {
                    return {};
                }
            },
        }),
    );

    app.listen(PORT, '0.0.0.0', () => console.log(`Server Running at PORT:${PORT}`));
};

init();