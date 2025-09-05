import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { Carousel } from 'react-responsive-carousel';
import { t } from 'i18next';

import Product from '../components/Product';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import CategoriesFilter from '../components/CategoriesFilter';

import { getError } from '../utils';
import '../styles/HomeScreen.css';

// Reducer para gerenciar estado da tela inicial
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload.products, pages: action.payload.pages, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'TOP_SELLERS_REQUEST':
      return { ...state, loadingTopUsers: true };
    case 'TOP_SELLERS_SUCCESS':
      return { ...state, topSellers: action.payload, loadingTopUsers: false };
    case 'TOP_SELLERS_FAIL':
      return { ...state, loadingTopUsers: false, errorTopUsers: action.payload };
    default:
      return state;
  }
};

export function HomeScreen() {
  const [{ loading, error, topSellers, loadingTopUsers, errorTopUsers }, dispatch] = useReducer(reducer, {
    topSellers: [],
    loading: true,
    error: '',
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState([]);
  const [showCarouselTopSellers, setShowCarouselTopSellers] = useState(false);
  const [showGridTopSellers, setShowGridTopSellers] = useState(false);

  // Rolar para o topo ao carregar a tela
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ajustar layout com base no tamanho da tela
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 540) {
        setShowCarouselTopSellers(true);
        setShowGridTopSellers(false);
      } else {
        setShowCarouselTopSellers(false);
        setShowGridTopSellers(true);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Buscar produtos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products?page=${page}`);
        setItems(data.products);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (page === 1) {
      fetchProducts();
    }
  }, [page]);

  // Buscar vendedores top
  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        dispatch({ type: 'TOP_SELLERS_REQUEST' });
        const { data } = await axios.get('/api/users/top-sellers');
        dispatch({ type: 'TOP_SELLERS_SUCCESS', payload: data.sellers });
      } catch (err) {
        dispatch({ type: 'TOP_SELLERS_FAIL', payload: getError(err) });
      }
    };
    fetchTopSellers();
  }, []);

  // Carregar mais produtos
  const handleShowMore = async () => {
    const newPage = page + 1;
    const { data } = await axios.get(`/api/products?page=${newPage}`);
    setItems([...items, ...data.products]);
    setPage(newPage);
  };

  return (
    <Container>

      {/* Carrossel Principal */}
    {/* <CarouselSlide/> */}

      {/* Layout Principal: Sidebar + Conteúdo */}
      <Row>
        {/* Sidebar - Filtros de Categorias */}
        <Col md={3}>
          <CategoriesFilter />

        </Col>
        {/* Conteúdo Principal */}
        <Col md={9}>

          {/* Top Sellers */}
          <h3>{t('thebestsuppliers')}</h3>
          {loadingTopUsers ? (
            <LoadingBox />
          ) : errorTopUsers ? (
            <MessageBox variant="danger">{errorTopUsers}</MessageBox>
          ) : (
            <>
              {topSellers.length === 0 && <MessageBox>{t('suppliersnotfound')}</MessageBox>}

              {showCarouselTopSellers && (
                <Carousel
                  showArrows
                  infiniteLoop
                  autoPlay
                  showThumbs={false}
                  showIndicators
                  emulateTouch
                  centerMode
                  centerSlidePercentage={90}
                  className="carousel-custom"
                >
                  {topSellers.map((seller) => (
                    <div key={seller._id} className="product-card">
                      <Product seller={seller} />
                    </div>
                  ))}
                </Carousel>
              )}

              {showGridTopSellers && (
                <Row>
                  {topSellers.map((seller) => (
                    <Col key={seller._id} sm={6} md={4} lg={3} className="mb-3">
                      <Product seller={seller} />
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}

          {/* Produtos Disponíveis */}
          <h3>{t('Productsforyou')}</h3>
          <Row>
            {items.map((product) => (
              <Col key={product._id} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product} />
              </Col>
            ))}
          </Row>

          {/* Botão de carregar mais */}
          {items.length === pageSize * page && (
            <div className="text-center mt-4">
              <Button className="customButton" onClick={handleShowMore}>
                {t('showmore')}
              </Button>
            </div>
          )}

        </Col>
      </Row>
    </Container>
  );
}

export default HomeScreen;
