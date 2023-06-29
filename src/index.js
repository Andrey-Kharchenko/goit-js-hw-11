import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let currentPage = 1;
let currentSearchQuery = '';
let lightbox;

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const searchQuery = searchForm.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
    return;
  }

  if (searchQuery !== currentSearchQuery) {
    currentPage = 1;
    gallery.innerHTML = '';
  }

  currentSearchQuery = searchQuery;

  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '37975010-22e06f5b9850d0937ed6c375a',
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: currentPage
      }
    });

    const images = response.data.hits;
    const totalHits = response.data.totalHits;

    if (images.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    images.forEach((image) => {
      const photoCard = createPhotoCard(image);
      gallery.appendChild(photoCard);
    });

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
  }
});

function createPhotoCard(image) {
  const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;

  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  const link = document.createElement('a');
  link.href = largeImageURL;

  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');

  const likesInfo = createInfoItem('Likes', likes);
  const viewsInfo = createInfoItem('Views', views);
  const commentsInfo = createInfoItem('Comments', comments);
  const downloadsInfo = createInfoItem('Downloads', downloads);

  info.appendChild(likesInfo);
  info.appendChild(viewsInfo);
  info.appendChild(commentsInfo);
  info.appendChild(downloadsInfo);

  link.appendChild(img);
  photoCard.appendChild(link);
  photoCard.appendChild(info);

  return photoCard;
}

function createInfoItem(label, value) {
  const p = document.createElement('p');
  p.classList.add('info-item');
  p.innerHTML = `<b>${label}:</b> ${value}`;

  return p;
}

function scrollToNextGroup() {
  const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth'
  });
}

window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    searchForm.dispatchEvent(new Event('submit'));
  }
});