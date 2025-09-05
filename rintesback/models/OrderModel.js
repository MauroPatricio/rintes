import mongoose from 'mongoose';

/**
 * Wishlist Schema - permite salvar produtos para compra futura
 */
const wishlistItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String },
  },
  { timestamps: true }
);

/**
 * Order Item Schema - itens do pedido
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    slug: { type: String },
    name: { type: String },
    description: { type: String },
    image: { type: String },
    images: [String],
    brand: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
    price: { type: Number },
    priceWithComission: { type: Number },
    discount: { type: Number },
    quantity: { type: Number, default: 0 },
    countInStock: { type: Number, default: 0, min: [0, 'countInStock deve ser >= 0'] },
    rating: { type: Number },
    numReviews: { type: Number },
    onSale: { type: Boolean, default: false },
    onSalePercentage: { type: Number },
    isActive: { type: Boolean, default: true },
    qualityType: { type: String }, // Original, Réplica, 1ª linha
    conditionStatus: { type: String }, // Novo, Usado
    isGuaranteed: { type: Boolean, default: false },
    guaranteedPeriod: { type: String },
    orderPeriod: { type: String },
    priceComission: { type: Number },
    comissionPercentage: { type: Number },
    priceFromSeller: { type: Number },

    // Campos customizáveis para diferentes sites
    goodType: { type: String }, // ex: Eletrônico, Carro, Alimento
    transportType: { type: String }, // ex: Caminhão, Motorizada, Pickup
    deliverCity: { type: String },
    origin: { type: String },
    destination: { type: String },
    specifications: { type: Map, of: String }, // atributos flexíveis
  },
  { _id: false }
);

/**
 * Order Schema - Pedido principal
 */
const orderSchema = new mongoose.Schema(
  {
    code: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    orderItems: [orderItemSchema],

    // Wishlist associada ao usuário
    wishlist: [wishlistItemSchema],

    // Promoções aplicadas ao pedido
    promotions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }],

    deliveryAddress: {
      fullName: { type: String },
      city: { type: String },
      address: { type: String },
      referenceAddress: { type: String },
      phoneNumber: { type: String },
      alternativePhoneNumber: { type: String },
    },

    deliveryman: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      photo: { type: String },
      name: { type: String },
      phoneNumber: { type: String },
      transport_type: { type: String },
      transport_color: { type: String },
      transport_registration: { type: String },
      pricetopay: { type: Number },
    },

    paymentMethod: { type: String },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      phoneNumber: String,
    },

    // Preços e impostos
    itemsPrice: { type: Number },
    itemsPriceForSeller: { type: Number },
    deliveryPrice: { type: Number },
    addressPrice: { type: Number },
    sellerPriceWithDeliver: { type: Number },
    totalPrice: { type: Number },
    ivaTax: { type: Number },
    siteTax: { type: Number },

    // Status do pedido
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isCanceled: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    isAvailableToDeliver: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    isInTransit: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: { type: String },
    stepStatus: { type: Number },

    // Flags administrativas
    deleted: { type: Boolean, default: false },
    canceledReason: { type: String },
    isDeletedBySeller: { type: Boolean, default: false },
    isDeletedByDeliverman: { type: Boolean, default: false },
    isDeletedByAdmin: { type: Boolean, default: false },
    isDeletedByRequester: { type: Boolean, default: false },
    isSupplierPaid: { type: Boolean, default: false },
    isDeliverPaid: { type: Boolean, default: false },
    isUserWantDelivery: { type: Boolean, default: false },
    isSellerNotified: { type: Boolean, default: false },

    address: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
