import express from 'express';
import User from '../models/UserModel.js';
import { baseUrl, generateToken, isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Product from '../models/ProductModel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
import mongoose from 'mongoose';
import TipoEstabelecimento from '../models/TipoEstabelecimento.js';

const userRouter = express.Router();

// All Users
userRouter.get(
  '/',
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const page = req.query.page || 1;
      const pageSize = 10;
      
      const users = await User.find()
        .skip(pageSize * (page - 1))
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .populate('seller.tipoEstabelecimento'); // Adicionado populate para tipoEstabelecimento
      
      const countUsers = await User.countDocuments();
      const pages = Math.ceil(countUsers / pageSize);
  
      res.send({ users, pages });
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: 'Erro ao buscar usuários' });
    }
  })
);


userRouter.get(
  "/tipoestabelecimentos",
  expressAsyncHandler(async (req, res) => {
    try {
      // Pegue todos IDs de tipos de estabelecimentos usados pelos sellers
      const usados = await User.distinct("seller.tipoEstabelecimento", { seller: { $exists: true } });

      // Agora busque esses tipos no modelo TipoEstabelecimento
      const tipoestabelecimentos = await TipoEstabelecimento.find({ _id: { $in: usados } });

      res.send({tipoestabelecimentos});
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: "Erro ao buscar tipos de estabelecimentos" });
    }
  })
);

// All Top Sellers
userRouter.get(
  '/top-sellers',
  expressAsyncHandler(async (req, res) => {
    try {
      const topSellers = await User.find({ 
        isSeller: true, 
        isApproved: true, 
        isBanned: false,
        'seller.tipoEstabelecimento': { $exists: true } // Garante que tem tipoEstabelecimento
      })
      .select('-password -token')
      .populate('seller.tipoEstabelecimento') // Popula os dados do tipo de estabelecimento
      .sort({ 'seller.rating': -1, 'seller.numReviews': -1 })
      .limit(4)
      .lean();

      if (!topSellers || topSellers.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Nenhum vendedor encontrado',
          data: []
        });
      }
      
      // Formata a resposta para incluir o tipo de estabelecimento
      const formattedSellers = topSellers.map(seller => ({
        ...seller,
        seller: {
          ...seller.seller,
          tipoEstabelecimento: seller.seller.tipoEstabelecimento?.name || 'Não especificado'
        }
      }));

      res.json({ 
        success: true,
        count: formattedSellers.length,
        sellers: formattedSellers 
      });
    } catch (error) {
      console.error('Erro ao buscar top sellers:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao processar sua solicitação'
      });
    }
  })
);

// All Sellers
userRouter.get(
  '/sellers',
  expressAsyncHandler(async (req, res) => {
    try {
      const page = req.query.page || 1;
      const pageSize = 10;
      const { tipoEstabelecimento } = req.query; // Adicionado filtro por tipo de estabelecimento

      const query = { 
        isSeller: true, 
        isApproved: true, 
        isBanned: false 
      };

      // Adiciona filtro por tipo de estabelecimento se fornecido
      if (tipoEstabelecimento && mongoose.Types.ObjectId.isValid(tipoEstabelecimento)) {
        query['seller.tipoEstabelecimento'] = tipoEstabelecimento;
      }

      const sellers = await User.find(query)
        .skip(pageSize * (page - 1))
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .populate('seller.province')
        .populate('seller.tipoEstabelecimento'); // Adicionado populate para tipoEstabelecimento
      
      const countSellers = await User.countDocuments(query);
      const pages = Math.ceil(countSellers / pageSize);

      res.send({
        sellers,
        pages,
        countSellers,
        currentPage: page
      });
    } catch (e) {
      console.error('Erro ao buscar vendedores:', e);
      res.status(500).send({ message: 'Erro ao buscar vendedores' });
    }
  })
);

userRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate('seller.province')
        .populate('seller.tipoEstabelecimento'); // Adicionado populate para tipoEstabelecimento
      
      if (user) {
        res.send({
          ...user.toObject(),
          seller: {
            ...user.seller.toObject(),
            tipoEstabelecimento: user.seller.tipoEstabelecimento?.name || 'Não especificado'
          }
        });
      } else {
        res.status(404).send({ message: 'Utilizador não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).send({ message: 'Erro interno ao buscar usuário' });
    }
  })
);
userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isSeller = req.body.isSeller;

        if (req.body.isSeller) {
          user.seller = {
            ...user.seller,
            name: req.body.sellerName || req.body.seller?.name || user.seller.name,
            description: req.body.sellerDescription || req.body.seller?.description || user.seller.description,
            logo: req.body.sellerLogo || req.body.seller?.logo || user.seller.logo,
            opentime: req.body.opentime || req.body.seller?.opentime || user.seller.opentime,
            closetime: req.body.closetime || req.body.seller?.closetime || user.seller.closetime,
            province: req.body.sellerLocation || req.body.seller?.province || user.seller.province,
            address: req.body.sellerAddress || req.body.seller?.address || user.seller.address,
            phoneNumberAccount: req.body.phoneNumberAccount || req.body.seller?.phoneNumberAccount || user.seller.phoneNumberAccount,
            alternativePhoneNumberAccount: req.body.alternativePhoneNumberAccount || req.body.seller?.alternativePhoneNumberAccount || user.seller.alternativePhoneNumberAccount,
            accountType: req.body.accountType || req.body.seller?.accountType || user.seller.accountType,
            accountNumber: req.body.accountNumber || req.body.seller?.accountNumber || user.seller.accountNumber,
            latitude: req.body.latitude || req.body.seller?.latitude || user.seller.latitude,
            longitude: req.body.longitude || req.body.seller?.longitude || user.seller.longitude,
            alternativeAccountType: req.body.alternativeAccountType || req.body.seller?.alternativeAccountType || user.seller.alternativeAccountType,
            alternativeAccountNumber: req.body.alternativeAccountNumber || req.body.seller?.alternativeAccountNumber || user.seller.alternativeAccountNumber,
            workDayAndTime: req.body.workDaysWithTime || req.body.seller?.workDayAndTime || user.seller.workDayAndTime,
            tipoEstabelecimento: req.body.tipoEstabelecimento || req.body.seller?.tipoEstabelecimento || user.seller.tipoEstabelecimento // Adicionado tipoEstabelecimento
          };
        } else {
          // Limpa os dados do seller se não for mais um vendedor
          user.seller = {
            name: "",
            description: "",
            logo: "",
            opentime: "",
            closetime: "",
            province: null,
            address: "",
            phoneNumberAccount: "",
            alternativePhoneNumberAccount: "",
            accountType: "",
            accountNumber: "",
            alternativeAccountType: "",
            alternativeAccountNumber: "",
            workDayAndTime: [],
            tipoEstabelecimento: null // Adicionado tipoEstabelecimento
          };
        }

        if (user.isDeliveryMan) {
          user.deliveryman = {
            ...user.deliveryman,
            photo: req.body.deliveryManPhoto,
            name: req.body.deliveryManName,
            phoneNumber: req.body.deliveryManPhoneNumber,
            transport_type: req.body.deliveryMantransportType,
            transport_registration: req.body.deliveryMantransportRegistration,
            transport_color: req.body.deliveryMantransportColor
          };
        }

        if (req.body.password) {
          user.password = bcrypt.hashSync(req.body.password, 8);
        }

        const updatedUser = await user.save();
        
        res.send({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          isDeliveryMan: updatedUser.isDeliveryMan,
          isSeller: updatedUser.isSeller,
          isBanned: updatedUser.isBanned,
          seller: updatedUser.seller,
          token: generateToken(updatedUser),
        });
      } else {
        res.status(404).send({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).send({ message: 'Erro ao atualizar perfil' });
    }
  })
);


userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      user.isSeller = Boolean(req.body.isSeller);
      user.isBanned = Boolean(req.body.isBanned);
      user.isDeliveryMan = Boolean(req.body.isDeliveryMan);
      user.isApproved = Boolean(req.body.isApproved);

      if(user.isBanned){
        user.isApproved=false;
         await Product.deleteMany({ seller: user._id });
      }

      if(user.isApproved){
        user.isBanned=false;
        await Product.updateMany({ seller: user._id }, { $set: { isActive: user.isApproved } });
      }

      await user.save();
      res.send({ message: 'Utilizador Actualizado Com Sucesso' });
    } else {
      res.status(404).send({ message: 'Utilizador não encontrado' });
    }
  })
);




// Get all seller users by establishment type ID
userRouter.get(
  '/byestablishment/:id',
  expressAsyncHandler(async (req, res) => {
    try {
      const establishmentTypeId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = 10;
      
      // Validate establishmentTypeId
      if (!mongoose.Types.ObjectId.isValid(establishmentTypeId)) {
        return res.status(400).send({ message: 'Invalid establishment type ID' });
      }

      // Query to find only approved sellers associated with the given establishment type
     const query = {
        isSeller: true,
        isApproved: true,
        'seller.tipoEstabelecimento': { $exists: true, $eq: establishmentTypeId }
      };

      const users = await User.find(query)
        .select('-password -__v') // Exclude sensitive fields
        .skip(pageSize * (page - 1))
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .populate('seller.tipoEstabelecimento'); // Populate establishment type name

      const countUsers = await User.countDocuments(query);
      const pages = Math.ceil(countUsers / pageSize);

      // Transform the data to include seller and establishment info
      const formattedUsers = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        seller: {
          name: user.seller?.name,
          logo: user.seller?.logo,
          description: user.seller?.description,
          tipoEstabelecimento: user.seller?.tipoEstabelecimento?.name,
          address: user.seller?.address,
          contact: user.seller?.phoneNumberAccount,
          isOpen: user.seller?.openstore
        },
        createdAt: user.createdAt
      }));

      res.send({
        users: formattedUsers,
        page,
        pages,
        countUsers
      });

    } catch (error) {
      console.error('Error fetching sellers by establishment:', error);
      res.status(500).send({ 
        message: 'Error fetching sellers',
        error: error.message 
      });
    }
  })
);



// Actualiza se a loja esta aberta ou fechada
// userRouter.put(
//   '/seller/:id',
//   // isAuth,
//   // isAdmin,
//   expressAsyncHandler(async (req, res) => {

//     const user = await User.findById(req.params.id);

//     if (user) {
    
//       user.seller.openstore = Boolean(req.body.isopenstore);

     
//       await user.save();
//       res.status(201).send({user,  message: 'Loja Actualizada com Sucesso' });
//     } else {
//       res.status(404).send({ message: 'Utilizador não encontrado' });
//     }
//   })
// );

// Actualiza o estado da loja e dos seus produtos de acordo com o estado da loja se esta aberta ou fechada
userRouter.put(
  '/seller/:id',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      const isOpenStore = Boolean(req.body.isopenstore);
      user.seller.openstore = isOpenStore;

      await user.save();

      // Atualizar todos os produtos com o estado atual da loja
      await Product.updateMany(
        { seller: req.params.id },
        { isSellerOpen: isOpenStore }
      );

     // Emitir evento pelo socket
    const io = req.app.get('io');
    io.emit('storeStatusChanged', {
      sellerId: req.params.id,
      isOpen: user.seller.openstore,
    });

      res.status(201).send({
        user,
        message: 'Loja e produtos atualizados com sucesso',
      });
    } else {
      res.status(404).send({ message: 'Utilizador não encontrado' });
    }
  })
);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Example: 'Gmail', 'Yahoo', 'Outlook'
  port: 587,
  secure: false,
  auth: {
    user: 'mauro.patricio1@gmail.com',      // Your email address
    pass: 'kfgg cmdk hvsp ctil',         // Your email password
  },
  tls:{
    rejectUnauthorized: false
  }
});

userRouter.post('/forget-password',
expressAsyncHandler(async(req, res)=>{
  const user = await User.findOne({email: req.body.email});

  if(user){
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '3h'})

    user.token = token 
    await user.save();

    console.log(`${baseUrl()}/reset-password/${token}`)

// Composicao do texto
const text = `<p>Por favor click no link abaixo para resetar a sua senha</p>
   <a href="${baseUrl()}/reset-password/${token}">Resetar a senha</a>`


// Email message configuration
const mailOptions = {
  from: 'mauro.patricio1@gmail.com',         
  to: user.email,       
  subject: 'Recuperação de senha – Nhiquela Shop',                
  text: text,
};

// Enviar email
transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.error('Error sending email:', error);
    res.status(404).send({message: 'Email não enviado'})

  } else {
    console.log('Email sent:', info.response);
    res.send({ message: 'Email enviado com Sucesso' });
  }
});
   

    

  }else{
    res.status(404).send({message: 'Utilizador não encontrado'})
  }
}));


userRouter.post('/reset-password', expressAsyncHandler(async (req, res)=>{
  jwt.verify(req.body.token, process.env.JWT_SECRET, async(err, decode)=>{
    if(err){
      res.status(401).send({message: 'Invalid Token'})
    }else{
      const user = await User.findOne({token: req.body.token});
      if(user){
        if(req.body.password){
          user.password = bcrypt.hashSync(req.body.password, 8)
          await user.save()
          res.send({message: 'Password Actualizada com successo'})
        }
      }else{
        res.status(404).send({message: 'Utilizador nao encontrado'})
      }
    }
  })
}))


userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const { phoneNumber, password, deviceToken } = req.body;

    let user = null;

    // Verificar se é email ou número de telefone
    if (phoneNumber.includes('@')) {
      user = await User.findOne({ email: phoneNumber });
    } else {
      if (!isNaN(phoneNumber)) {
        user = await User.findOne({ phoneNumber });
      } else {
        return res.status(400).send({ message: 'Número de telefone inválido.' });
      }
    }

        // Verificar senha
    if(user){

      const passwordMatch = bcrypt.compareSync(password, user?.password);
      if (!passwordMatch) {
        return res.status(401).send({ message: 'Senha inválida.' });
      }
    }


    
    if (!user) {
      return res.status(401).send({ message: 'Não é possível fazer login a conta não existe.' });
    }

    // Verificar se está banido
    if (user.isBanned) {
      return res.status(401).send({ message: 'Esta conta foi BANIDA. Por favor, contacte o Administrador.' });
    }

    // Atualizar deviceToken se presente
    if (deviceToken) {
      user.deviceToken = deviceToken;
      await user.save(); // salvar no banco
    }


    // Login bem-sucedido
    return res.status(200).send({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      isApproved: user.isApproved,
      isBanned: user.isBanned,
      isDeliveryMan: user.isDeliveryMan,
      isSeller: user.isSeller,
      name: user.name,
      phoneNumber: user.phoneNumber,
      seller: user.seller,
      token: generateToken(user),
    });
  })
);



userRouter.post(
  '/signinseller',
  expressAsyncHandler(async (req, res) => {
    const { phoneNumber, password, deviceToken } = req.body;
    let user = null;

    // 🔍 Buscar apenas usuários que sejam vendedores (isSeller: true)
    if (phoneNumber.includes('@')) {
      user = await User.findOne({ email: phoneNumber, isSeller: true });
    } else if (!isNaN(phoneNumber)) {
      user = await User.findOne({ phoneNumber, isSeller: true });
    } else {
      return res.status(400).send({ message: 'Número de telefone inválido' });
    }
       // Verificação de senha
    if(user){
      const isPasswordCorrect = bcrypt.compareSync(password, user?.password);
  
  
        if (!isPasswordCorrect) {
        return res.status(401).send({ message: 'Senha inválida' });
      }
    }

    if (!user) {
      return res.status(401).send({ message: 'Usuário não encontrado ou não é vendedor' });
    }

    if (user?.isBanned) {
      return res.status(401).send({
        message: 'Esta conta foi BANIDA! Por favor, contacte o administrador.',
      });
    }

    // Atualizar token do dispositivo, se fornecido
    if (deviceToken) {
      user.deviceToken = deviceToken;
      await user.save();
    }
    // ✅ Resposta com dados do usuário e token
    res.status(200).send({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      isApproved: user.isApproved,
      isBanned: user.isBanned,
      isDeliveryMan: user.isDeliveryMan,
      isSeller: user.isSeller,
      name: user.name,
      phoneNumber: user.phoneNumber,
      seller: user.seller,
      token: generateToken(user),
    });
  })
);


userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    try {
      const userExist = await User.findOne({ phoneNumber: req.body.phoneNumber });
      const emailExist = await User.findOne({ email: req.body.email });

      if (emailExist) {
        return res.status(409).send({ message: 'Já existe um email idêntico registrado' });
      }

      if (!userExist) {
        const newUser = new User({
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
          isSeller: req.body.isSeller,
        });


        if (newUser.isSeller) {
          newUser.seller = {
            name: req.body.sellerName || req.body.seller?.name,
            logo: req.body.sellerLogo || req.body.seller?.logo,
            description: req.body.sellerDescription || req.body.seller?.description,
            province: req.body.sellerLocation || req.body.seller?.province,
            address: req.body.sellerAddress || req.body.seller?.address,
            phoneNumberAccount: req.body.phoneNumberAccount || req.body.seller?.phoneNumberAccount,
            alternativePhoneNumberAccount: req.body.alternativePhoneNumberAccount || req.body.seller?.alternativePhoneNumberAccount,
            accountType: req.body.accountType || req.body.seller?.accountType,
            accountNumber: req.body.accountNumber || req.body.seller?.accountNumber,
            alternativeAccountType: req.body.alternativeAccountType || req.body.seller?.alternativeAccountType,
            alternativeAccountNumber: req.body.alternativeAccountNumber || req.body.seller?.alternativeAccountNumber,
            workDayAndTime: req.body.workDaysWithTime || req.body.seller?.workDayAndTime,
            latitude: req.body.latitude || req.body.seller?.latitude,
            longitude: req.body.longitude || req.body.seller?.longitude,
            tipoEstabelecimento: req.body.tipoEstabelecimento || req.body.seller?.tipoEstabelecimento // Adicionado tipoEstabelecimento
          };
        }

        const user = await newUser.save();
        return res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin,
          isDeliveryMan: user.isDeliveryMan,
          isSeller: user.isSeller,
          isBanned: user.isBanned,
          token: generateToken(user),
        });
      }

      res.status(409).send({ message: 'Número de registo existente' });
    } catch (error) {
            console.log(error)
      console.error('Erro no registro de usuário:', error);
      res.status(500).send({ message: 'Erro interno no registro' });
    }
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {

      await Product.deleteMany({seller: user._id });

      await user.deleteOne();

      res.send({ message: `Utilizador removido com sucesso` });
    } else {
      res.status(404).send({ message: 'Utilizador não encontrado' });
    }
  })
);

userRouter.post('/updateDeviceToken', async (req, res) => {
  const { userId, deviceToken } = req.body;
  await User.findByIdAndUpdate(userId, { deviceToken: deviceToken });
  res.send({ success: true });
});


userRouter.put('/updateDeviceToken/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      deviceToken: req.body.deviceToken,
    }, { new: true });

    if (!user) return res.status(404).send({ message: 'Usuário não encontrado' });

    res.send({ message: 'DeviceToken atualizado com sucesso', user });
  } catch (err) {
    res.status(500).send({ message: 'Erro ao atualizar token' });
  }
});


// Backend: routes/users.js ou semelhante
userRouter.patch('/updatePushToken/:id', async (req, res) => {
  const { id } = req.params;
  const { pushToken } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { pushToken }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'PushToken atualizado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar PushToken.' });
  }
});


export default userRouter;
