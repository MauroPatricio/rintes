import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useReducer, useContext, useRef, useState } from 'react';
import Rating from '../components/Rating';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { formatedDate, getError } from '../utils';
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';


const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };

    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };

    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };

    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };

      case 'CATEGORIES_REQUEST':
      return { ...state, loadingCategories: true };

    case 'CATEGORIES_SUCCESS':
      return { ...state, loadingCategories: false, categories: action.payload };

    case 'CATEGORIES_FAIL':
      return { ...state, loadingCategories: false };

    case 'FETCH_REQUEST':
      return { ...state, loading: true };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

function ProductScreen() {
  const { t } = useTranslation();

  const params = useParams();

  const { id } = params;
  const navegate = useNavigate();
  const reviewsRef = useRef();
  const [{ loading, error, product, loadingCreateReview, categories }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });

  useEffect(() => {
    dispatch({ type: 'FETCH_REQUEST' });

    const fetchData = async () => {
      try {
        const result = await axios.get(`/api/products/${id}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [id]);

  

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const { cart, userInfo, changelng} = state;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        dispatch({ type: 'CATEGORIES_REQUEST' });
        const { data } = await axios.get('/api/categories')

        dispatch({ type: 'CATEGORIES_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'CATEGORIES_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [categories]);


  const addOnCartAndRedirectHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);


    if (!selectedColor) {
      toast.error('Por favor, Informe a cor que deseja');
      return;
    }

    if (!selectedSize) {
      toast.error('Por favor, Informe o tamanho que deseja');
      return;
    }
  

    if (data.countInStock < quantity) {
      toast.error('Desculpe, o Produto não está disponível');
      // window.alert(`Desculpe, o Produto não está disponível`);
      return;
    }

    product.color=selectedColor
    product.size=selectedSize

    
    if(cart.cartItems.length > 0 && product.seller._id !== cart.cartItems[0].seller._id){
      ctxDispatch({
        type: 'ADD_ITEM_FAIL',
        payload: t('onlyonesupplier'),
      });
    }else{
      ctxDispatch({
        type: 'ADD_ITEM_ON_CART',
        payload: { ...product, quantity: quantity },
      });
    }
navegate('/cart')
  };


  const addOnCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);


    if (!selectedColor) {
      toast.error('Por favor, Informe a cor que deseja');
      return;
    }

    if (!selectedSize) {
      toast.error('Por favor, Informe o tamanho que deseja');
      return;
    }
  

    if (data.countInStock < quantity) {
      toast.error('Desculpe, o Produto não está disponível');
      // window.alert(`Desculpe, o Produto não está disponível`);
      return;
    }

    product.color=selectedColor
    product.size=selectedSize

    
    if(cart.cartItems.length > 0 && product.seller._id !== cart.cartItems[0].seller._id){
      ctxDispatch({
        type: 'ADD_ITEM_FAIL',
        payload: t('onlyonesupplier'),
      });
    }else{
      ctxDispatch({
        type: 'ADD_ITEM_ON_CART',
        payload: { ...product, quantity: quantity },
      });
    }

    navegate(`/seller/${product.seller._id}`);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Por favor, deixe o seu comentário e Pontuação');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success(data.message);
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
      setRating('');
      setComment('')
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <h3><p>{t('productdetails')}</p></h3>
      <Row>
        <Col md={5}>
          <img
            className="large-img"
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
           <Row xs={1} md={2} className="g-2">
        {[product.image, ...product.images].map((x) => (

            <Button key={x}
              className="thumbnail"
              type="button"
              variant="light"
              onClick={() => setSelectedImage(x)}
            >
              <Card.Img
                variant="top"
                src={x}
                className="cardImg"
                alt="Produto"
              ></Card.Img>
            </Button>
        ))}
      </Row>
        </Col>
       
        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{changelng==='pt'?product.nome:product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
            {product.slug}            
            </ListGroup.Item>

            <ListGroup.Item>
              <Rating rating={product.rating} numReviews={product.numReviews} />
            </ListGroup.Item>
            <ListGroup.Item>{t('supplier')}: 
            <Link
              className="link"
              to={product.seller ? `/seller/${product.seller._id}` : ''}
            > 
             <b> {product.seller && product.seller.seller && product.seller.seller.name}</b>
              </Link></ListGroup.Item>
              <ListGroup.Item>
                 {t('publicationdate')}: {formatedDate(product.createdAt)}            
            </ListGroup.Item>

            {product.isOrdered &&<ListGroup.Item>{t('makeorder')}:<Badge bg='info'>{t('yes')}</Badge>  </ListGroup.Item>}

            {product.isOrdered &&<ListGroup.Item>{t('deliveryestimate')}: <Badge bg='info'>{product.orderPeriod}</Badge> </ListGroup.Item>}

            {product.isGuaranteed &&<ListGroup.Item>{t('withguarantee')}: <Badge bg='info'>{t('yes')}</Badge></ListGroup.Item>}

            {product.isGuaranteed &&<ListGroup.Item>{t('warrantyperiod')}: <Badge bg='info'>{product.guaranteedPeriod}</Badge></ListGroup.Item>}

            
           {product.conditionStatus &&<ListGroup.Item>{t('status')}: <Badge bg="success">{changelng==='pt'?product.conditionStatus.nome: product.conditionStatus.name}</Badge> </ListGroup.Item>}

            <ListGroup.Item>{t('brand')}: {product.brand}</ListGroup.Item>

           {product.qualityType && <ListGroup.Item>{t('designation')}: {changelng==='pt'?product.qualityType.nome:product.qualityType.name} </ListGroup.Item>}

            <ListGroup.Item>{t('quantity')}: {product.countInStock} {t('unit')}</ListGroup.Item>


  

            <ListGroup.Item>{t('priceperunit')}:  
              {product.onSale ? (
                <>
                <b style={{color: '#a435f0'}}>{product.discount} MT</b>
                  
                </>
              ):<b style={{color: '#a435f0'}}>{product.price} MT</b>}</ListGroup.Item>

{/*   
{product &&
            <ListGroup.Item>
                  <Form.Group className="mb-3" controlId="cor">
                   <Form.Label>Cor:</Form.Label>
                        <Form.Select aria-label="Cor"
                      value={selectedColor}
                      onChange={(e)=>setSelectedColor(e.target.value)} required>
                        <option value="">Seleccione</option>
                        {product && product.color && product.color.map(color => (
                        <option key={color._id} value={color.name}>
                          {color.name}
                        </option>
                    ))}
                      </Form.Select>
                  </Form.Group>
                  </ListGroup.Item>} */}



                  <ListGroup.Item>
                  <Form.Group className="mb-3" controlId="Cor">
                   <Form.Label>{t('color')}:</Form.Label>
                        <Form.Select aria-label="Cor"
                      value={selectedColor}
                      onChange={(e)=>setSelectedColor(e.target.value)} required>
                        <option value="">{t('select')}</option>
                        {product && product.color && product.color.map(color => (
                        <option key={color._id} value={color.name}>
                          {changelng==='pt'?color.nome:color.name}
                        </option>
                    ))}
                      </Form.Select>
                  </Form.Group>
                  </ListGroup.Item>

            {/* <ListGroup.Item> Cor:
              <div style={{ maxHeight: '80px', overflowY: 'scroll' }}>
                  {product.color.map((item) => (

                    <Form.Check
                    required
                      key={item._id}
                      type="radio"
                      name="radioGroup"
                      value={item.name}
                      label={item.name}
                      checked={selectedColor === item.name }
                      onChange={(e) => setSelectedColor(e.target.value)}
                      />

                  ))}
                  </div>
                  </ListGroup.Item>  */}

                  <ListGroup.Item>
                  <Form.Group className="mb-3" controlId="Tamanho">
                   <Form.Label>{t('size')}:</Form.Label>
                        <Form.Select aria-label="Tamanho"
                      value={selectedSize}
                      onChange={(e)=>setSelectedSize(e.target.value)} required>
                        <option value="">{t('select')}</option>
                        {product && product.size && product.size.map(size => (
                        <option key={size._id} value={size.name}>
                          {changelng==='pt'?size.nome:size.name}
                        </option>
                    ))}
                      </Form.Select>
                  </Form.Group>
                  </ListGroup.Item>


                  {/* <ListGroup.Item> Tamanho:
                  <div style={{ maxHeight: '80px', overflowY: 'scroll' }}>

                  {product.size.map((item) => (
             
                      <Form.Check
                      required
                        key={item._id}
                        type="radio"
                        name="radioGroup2"
                        value={item.name}
                        label={item.name}
                         checked={selectedSize === item.name}
                         onChange={(e) => setSelectedSize(e.target.value)}
                         />
            
                  ))}
                </div> 
                 </ListGroup.Item>  */}
                    
            
            
            <ListGroup.Item>
              {t('productdescription')}:
              <Form.Control
                as="textarea"
                value={product.description}
                readOnly
                rows={5}
              ></Form.Control>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                                <Row>
                                                  <Col>
                                                    {product && product.onSale && <span>{t('onsale')}</span> }
                                                    </Col>
                                                    <Col>
                                                    {product && product.onSale && <Badge bg='success'><span>{product.onSalePercentage}% {t('discount')}</span> </Badge>}
                                                    </Col>
                                </Row>
                    </ListGroup.Item>

                    <ListGroup.Item>

        

                  <Row>
                    <Col>{t('quantityinstock')}</Col>
                    <Col>
                      {product.countInStock > 0 && product.seller!== null ? (
                        <Badge bg="success">{t('available')}</Badge>
                      ) : (
                        <Badge bg="danger">{t('unavailable')}</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>


                                  
                                  <Row>
                                
                                    <Col>{t('price')}</Col>

                                    <Col>  {product.onSale ? (
                                <>
                                &nbsp;

                                <b className='text_color'>{product.discount} MT</b>
                                
                                  
                                </>
                              ):<b className='text_color'>{product.price} MT</b>}

                                  </Col>
                                  </Row>
                  </ListGroup.Item>
                  
                <p></p>
                {product.countInStock > 0 && product.seller && (
                  <div className="d-grid">
                    <Button className='customButtom' variant='light' onClick={addOnCartHandler}  >
                     {t('addoncartandseeseller')}
                    </Button>
                  </div>
                )}
                <br/>
                 {product.countInStock > 0 && product.seller && (
                  <div className="d-grid">
                    <Button className='customButtom' variant='light' onClick={addOnCartAndRedirectHandler}  >
                     {t('addoncartandredirect')}
                    </Button>
                  </div>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

 

      <div className="my-3">
        <h2 ref={reviewsRef}>{t('comments')}</h2>
        <div className="mb-3">
          {product.reviews.length === 0 && (
            <MessageBox> {t('nocomments')}</MessageBox>
          )}
        </div>
      </div>
      <ListGroup>
        {product.reviews.map((review) => (
          <ListGroup.Item key={review._id}>
            {formatedDate(review.createdAt)}<br/>
            <strong>{review.name}</strong>
            <Rating rating={review.rating} caption=" "></Rating>
            {review.comment}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="my-3">
        {userInfo ? (
          <Form onSubmit={submitHandler}>
            <Form.Group>
              <Form.Label>{t('rating')}</Form.Label>
              <Form.Select
                aria-label="Rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">{t('select')}</option>
                <option value="1">1 - Péssimo</option>
                <option value="2">2 - Aceitável</option>
                <option value="3">3 - Bom</option>
                <option value="4">4 - Muito Bom</option>
                <option value="5">5 - Excelente</option>
              </Form.Select>
            </Form.Group>
            &nbsp;
            <FloatingLabel
              controlId="floatingTextarea"
              label="Seu comentário"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="Deixe aqui o seu comentário"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></Form.Control>
            </FloatingLabel>
            <div className="mb-3">
              <Button disabled={loadingCreateReview} className='customButtom' variant="light" type="submit">
                {t('comment')}
              </Button>
              {loadingCreateReview && <LoadingBox></LoadingBox>}
            </div>
          </Form>
        ) : (
          <MessageBox>
            {t('please')}{' '}
            <Link className="link" to={`/signin?redirect=/products/${product._id}`}>
              {' '}
              {t('login')}
            </Link>{' '}
            {t('leaveyourcomment')}
          </MessageBox>
        )}
      </div>
    </div>
  );
}
export default ProductScreen;
