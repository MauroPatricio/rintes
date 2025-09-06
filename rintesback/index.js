import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import seedRoutes from './routes/seedRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import categoryRouter from './routes/categoryRoutes.js';
import path from 'path';
import provinceRoutes from './routes/provinceRoutes.js';
import documentTypeRoutes from './routes/documentTypeRoutes.js';
import qualityTypeRouter from './routes/qualityTypeRoutes.js';
import conditionStatusRouter from './routes/conditionStatusRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import sizeRoutes from './routes/sizeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import requestDeliverRoutes from './routes/requestDeliverRoutes.js';
import bodyParser from 'body-parser';
import cartRoutes from './routes/cartRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';

// **Nova importação**
import tipoEstabelecimentoRoutes from './routes/tipoEstabelecimentoRoutes.js';

import mpesa from 'mpesa-node-api';

import Payment from './models/PaymentModel.js'
import config from './config.js';
import Order from './models/OrderModel.js';
import cron from 'node-cron';
import notificationRouter from './routes/notificationRoutes.js';
import paymentRouterEmola from './routes/paymentEmolaRoutes.js';
import walletRouter from './routes/walletRoutes.js';
import subcategoryRouter from './routes/subcategoryRoutes.js';


// Carregando variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectei me ao MongoDB com SUCESSO');
  })
  .catch((err) => {
    console.log(err.message);
  });

// **Inicializando Express**
const app = express();
app.use(express.json());
app.use(cors());

// Configuração de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.urlencoded({ extended: true }));

// **Adicionando sua nova rota aqui**
app.use('/api/tipoestabelecimentos', tipoEstabelecimentoRoutes);

// Configuração das demais rotas
app.use('/api/seed', seedRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/subcategories', subcategoryRouter);

app.use('/api/provinces', provinceRoutes);
app.use('/api/documents', documentTypeRoutes);
app.use('/api/qualitytype', qualityTypeRouter);
app.use('/api/conditionstatus', conditionStatusRouter);
app.use('/api/colors', colorRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/paymentsemola', paymentRouterEmola);

app.use('/api/requestdeliver', requestDeliverRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/notifications', notificationRouter);

app.use('/api/wallet', walletRouter);


// **Configuração do diretório e frontend**
const __dirname = path.resolve();
// const rootDir = path.join(__dirname, '..');
app.use(express.static(path.join(__dirname, '/frontend/build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/build/index.html'));});

// Middleware de erro
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: err.message });
});

// Configuração do servidor HTTP e WebSocket
const port = process.env.PORT || 5000;
const httpServer = http.Server(app);
const users = [];

const io = new Server(httpServer, { cors: { origin: '*' } });



io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log('Offline', user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit('updateUser', user);
      }
    }
  });

  socket.on('onLogin', (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    const existUser = users.find((x) => x._id === updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    console.log('Online', user.name);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      io.to(admin.socketId).emit('updateUser', updatedUser);
    }
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit('listUsers', users);
    }
  });

  socket.on('onUserSelected', (user) => {
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      io.to(admin.socketId).emit('selectUser', existUser);
    }
  });

  socket.on('onMessage', (message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        io.to(user.socketId).emit('message', message);
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit('message', message);
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      } else {
        io.to(socket.id).emit('message', {
          name: 'Admin',
          body: 'Me desculpe. Neste momento não me encontro disponível',
        });
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

app.set('io', io);


// Executa a cada 1 minutos
// cron.schedule('*/1 * * * *', async () => {
//   const start = Date.now();
//   console.log(`🚀 Início da execução do cron às ${new Date().toISOString()}`);

//   try {
//     const orders = await Order.aggregate([
//       { $match: { isPaid: true, isSupplierPaid: false } },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'seller',
//           foreignField: '_id',
//           as: 'seller'
//         }
//       },
//       { $unwind: "$seller" },
//       { $project: { "seller.password": 0 } }
//     ]);

//     await Promise.allSettled(orders.map(async (order) => {
//       try {
//         const orderToProcess = await Order.findOneAndUpdate(
//           { _id: order._id, isSupplierPaid: false },
//           { $set: { isSupplierPaid: true } },
//           { new: true }
//         );

//         if (!orderToProcess) return;

//         const numbrSeller = order.seller?.seller?.phoneNumberAccount;
//         const sellerNumber =
//           numbrSeller?.toString().length === 9
//             ? Number('258' + numbrSeller)
//             : numbrSeller;

//         const priceForSeller = order.itemsPriceForSeller;

//         if (sellerNumber && priceForSeller) {
//           const supplier = await paySupplier(sellerNumber, priceForSeller, orderToProcess);

//           await salvarPagamento({
//             senderNumber: sellerNumber,
//             amount: priceForSeller,
//             code: 'INS-0',
//             description: `Pagamento realizado ao Fornecedor pelo pedido ${orderToProcess?.code}`,
//             transaction: supplier.transactionId,
//             conversationId: supplier.conversationId,
//             reference: supplier.reference,
//             paid: true,
//             receiverNumber: process.env.MPESA_SERVICE_PROVIDER_CODE,
//           });

//           console.log(`✅ Pagamento realizado para o pedido ${orderToProcess.code}`);
//         }
//       } catch (err) {
//         console.error(`❌ Erro no pagamento do pedido ${order.code}: ${err.message}`);
//         await Order.findByIdAndUpdate(order._id, { $set: { isSupplierPaid: false } });
//       }
//     }));
//   } catch (err) {
//     console.error('Erro ao verificar pedidos pagos pelo comprador!', err?.message);
//   } finally {
//     const duration = Date.now() - start;
//     console.log(`✅ Fim da execução do cron. Duração: ${duration}ms`);
//   }
// });



async function paySupplier(sellerNumber, priceForSeller, order, maxAttempts = 2, delay = 5000) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const referenceCode = randomString(5);
      mpesa.initializeApi({ 
        baseUrl: config.MPESA_API_HOST,
        apiKey: config.MPESA_API_KEY,
        publicKey: config.MPESA_PUBLIC_KEY,
        origin: config.MPESA_ORIGIN,
        serviceProviderCode: config.MPESA_SERVICE_PROVIDER_CODE,
      });


      const response = await mpesa.initiate_b2c(priceForSeller, sellerNumber, referenceCode, referenceCode);

      if (response?.data?.output_ResponseCode === 'INS-0') {
        return {
          transactionId: response.data.output_TransactionID,
          conversationId: response.data.output_ConversationID,
          reference: response.data.output_ThirdPartyReference,
        };
      } else {
        lastError = new Error(response?.data);
        console.log(`Tentativa ${attempt} Pedido: ${order.code} falhou: ${lastError}`);

        await new Promise(r => setTimeout(r, delay)); 
      }
    } catch (err) {
      lastError = err;
      console.log(lastError)
      console.log(`Tentativa ${attempt} Pedido: ${order.code} deu erro: ${lastError.output_ResponseDesc}`);

      await new Promise(r => setTimeout(r, delay)); 
    }
  }
  
  throw lastError;
}


async function salvarPagamento(data) {
  const pagamento = new Payment(data);
  return await pagamento.save();
}

function randomString(codeLength){
    const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        { length: codeLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
      );
      
    const randomString = randomArray.join("");
    return randomString;
}
