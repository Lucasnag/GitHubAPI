//Get DOM Elements
let getReposFormElement = document.getElementById('get-repos-form');
let searchingBoxElement = document.getElementById('searching-box');
let userDataElement = document.getElementById('user-data');
let resultsBoxElement = document.getElementById('results-box');
let reposListElement = document.getElementById('repos-list');
let errorBoxElement = document.getElementById('error-box');
let errorMessageElement = document.getElementById('error-message');
let paginatorElement = document.getElementById('paginator');
let paginatorInfoElement = document.getElementById('paginator-info');
let prevButtonElement = document.getElementById('prev-button');
let nextButtonElement = document.getElementById('next-button');

//Declare and initializate vars/CONST 
let userName = '';
let repos = [];
let page = 1;
const per_page = 10;
let public_repos = 0;
let pages = 1;

//Submit Actions
const submit = (e) => {
  e.preventDefault();
  searching();
  resetVars();
  showPaginator(false);
  userName = getReposFormElement.elements['userName'].value;
  if(validator(userName)){  
    getUser(userName)
      .then((userData) => {
        if(!userData.message){
          public_repos = userData.public_repos
          if(public_repos > 0){
            calculatePages();
            getRepos(userName, 1)
            .then(reposData => {
              injectReposData(reposData);
              injectUserData(userData);
              success();
            })
            .catch((error) => {
              error('Fetch data error');
            });
          }else{
            injectUserData(userData);
            injectNoReposTemplate();
            success();
          }
        }else{
          error('Does not exist');
        }
      })
      .catch((error) => {
        error('Fetch data error');
      });
  }else{
    error('Invalid value');
  }
}

//Add event listener for submit event
getReposFormElement.addEventListener('submit', submit);

const validator = (value) => {
  return (value.length > 0 && !(value.trim() == ""));
}

const clearRepos = () => {
  reposListElement.innerHTML = '';
}

//Display Elements for searching
const searching = () => {
  errorBoxElement.style.display = 'none';
  resultsBoxElement.style.display = 'none';
  searchingBoxElement.style.display = 'block';
  clearRepos();
}

//Display Elements for success
const success = () => {
  searchingBoxElement.style.display = 'none';
  errorBoxElement.style.display = 'none';
  resultsBoxElement.style.display = 'block';
}

//Display Elements for error
const error = (message) => {
  searchingBoxElement.style.display = 'none';
  resultsBoxElement.style.display = 'none';
  errorMessageElement.innerText = message;
  errorBoxElement.style.display = 'block';
}

//Get repos by user with fetch() api
const getUser = async (userName) => {
  let response = await fetch(`https://api.github.com/users/${userName}`);
  let data = response.json();
  return data;
}

//Get repos by userName, page with fetch() api 
const getRepos = async (page) => {
  let response = await fetch(`https://api.github.com/users/${userName}/repos?page=${page}&per_page=${per_page}`);
  let data = response.json();
  return data;
}

//Create templates for each repo with templates literal
const createUserDataTemplate = (userData) => {
  return  `<p class="user-name">@${userData.login}</p>
          <h2 class="full-name">${userData.name || "*" }</h2>
          <p class="bio">${userData.bio || "*" }</p>`;
}

//Create templates for each repo with templates literal
const createRepoDataTemplate = (repo) => {
  return `<li class="repo">
            <span class="repo-name">${ repo.name }</span>
            <span class="repo-data">
              <span class="repo-stars">
                <iconify-icon data-icon="octicon:star"></iconify-icon> ${ repo.stargazers_count }
              </span>
              <span class="repo-forks">
                <iconify-icon data-icon="octicon-repo-forked"></iconify-icon> ${ repo.forks_count }
              </span>
            </span>
          </li>`;
}

//Create templates for paginator
const createPaginatorTemplate = () => {
  reposListElement.innerHTML = `<li class="repo">
            <p class="no-repos">User has no repositories</p>
          </li>`;
}

//Create templates for each repo with templates literal
const injectNoReposTemplate = () => {
  reposListElement.innerHTML = `<li class="repo">
            <p class="no-repos">User has no repositories</p>
          </li>`;
}


const injectUserData = (userData) => {
  userDataElement.innerHTML = createUserDataTemplate(userData);
}

const injectReposData = (reposData) => {
  repos = reposData;
  repos.map(repoData => {
    reposListElement.innerHTML += createRepoDataTemplate(repoData);
  });
}

const calculatePages = () => {
  if(public_repos > per_page){
    pages = Math.ceil(public_repos / per_page);
    showPaginatorInfo();
    showPaginator(true);
  }else{
    showPaginator(false);
  }
}

const showPaginator = (value) => {
  if(value){
    paginatorElement.style.display = 'block';
    prevButtonElement.disabled = true;
  }else{
    paginatorElement.style.display = 'none';
  }
}

const chagePage = (direction) => {
  if(direction === 'prev'){
    page--;
  }else if(direction === 'next'){
    page++;
  }
  checkPageToDisableButtons(page);
  getRepos(page)
    .then(reposData => {
        clearRepos();
        injectReposData(reposData);
        showPaginatorInfo();
        success();
    })
    .catch((error) => {
      error('Fetch data error');
    });
}

const checkPageToDisableButtons = (page) => {
  if(page === 1){
    prevButtonElement.disabled = true;
    nextButtonElement.disabled = false;
  }else if(page == pages){
    prevButtonElement.disabled = false;
    nextButtonElement.disabled = true;
  }else{
    prevButtonElement.disabled = false;
    nextButtonElement.disabled = false;
  }
}

const showPaginatorInfo = () => {
  paginatorInfoElement.innerText = `${page} of ${pages}`;
}

const resetVars = () => {
  userName = '';
  repos = [];
  page = 1;
  public_repos = 0;
  pages = 1;
}