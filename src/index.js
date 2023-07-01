import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const API_KEY = '37975010-22e06f5b9850d0937ed6c375a';

// Переменные состояния
let currentPage = 1;
let currentSearchQuery = '';
let lightbox;
let isLoading = false;

// Обработчик события отправки формы
searchForm.addEventListener('submit', handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();

  const searchQuery = searchForm.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    showError('Please enter a search query.');
    return;
  }

  // Функция для отображения ошибки
  function showError(message) {
    Notiflix.Notify.failure(message);
  }

  if (searchQuery !== currentSearchQuery) {
    currentPage = 1;
    gallery.innerHTML = '';
  }

  currentSearchQuery = searchQuery;

  await fetchData(searchQuery);
}

// Функция для загрузки данных с помощью API
async function fetchData(searchQuery) {
  if (isLoading) return;
  isLoading = true;

  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 20,
        page: currentPage
      }
    });

    const images = response.data.hits;
    const totalHits = response.data.totalHits;

    if (images.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    const markup = createMarkup(images);
    gallery.insertAdjacentHTML('beforeend', markup);

    if (currentPage === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    currentPage++;

    if (!lightbox) {
      lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250
      });
    } else {
      lightbox.refresh();
    }

    scrollToNextGroup();
  } catch (error) {
    Notiflix.Notify.failure('An error occurred while fetching the images. Please try again later.');
    console.error(error);
  } finally {
    isLoading = false;
  }
}

// Функция для создания разметки галереи изображений
function createMarkup(images) {
  return images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
    <li class="gallery__item">
      <a class="gallery__link" href="${largeImageURL}">
        <img class="gallery__image" src="${webformatURL}" alt="${tags}" title="${tags}" />
        <div class="info">
          <h2>Likes: <span>${likes}</span></h2>
          <h2>Views: <span>${views}</span></h2>
          <h2>Downloads: <span>${downloads}</span></h2>
          <h2>Comments: <span>${comments}</span></h2>
        </div>
      </a>
    </li>
  `).join('');
}

// Функция для прокрутки к следующей группе изображений
function scrollToNextGroup() {
  const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}

// Обработчик события прокрутки страницы
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    searchForm.dispatchEvent(new Event('submit'));
  }
});