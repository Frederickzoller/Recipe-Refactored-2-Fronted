const API_BASE_URL = 'https://recipe-app-backend-1.onrender.com';

// DOM elements
const recipesList = document.getElementById('recipes-list');
const recipesContainer = document.getElementById('recipes-container');
const addRecipeForm = document.getElementById('add-recipe-form');
const recipeForm = document.getElementById('recipe-form');
const homeLink = document.getElementById('home-link');
const addRecipeLink = document.getElementById('add-recipe-link');
const searchInput = document.getElementById('search-input');
const recipeDetails = document.getElementById('recipe-details');

// Event listeners
homeLink.addEventListener('click', showRecipesList);
addRecipeLink.addEventListener('click', showAddRecipeForm);
recipeForm.addEventListener('submit', handleAddRecipe);
searchInput.addEventListener('input', handleSearch);

// Global variables
let allRecipes = [];

// Functions
async function fetchRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        allRecipes = await response.json();
        displayRecipes(allRecipes);
    } catch (error) {
        console.error('Error:', error);
        recipesContainer.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
    }
}

function displayRecipes(recipes) {
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <h2>${recipe.title}</h2>
            <p>${recipe.description}</p>
            <button class="view-details-btn" data-id="${recipe.id}">View Details</button>
        `;
        recipesContainer.appendChild(recipeCard);
    });

    // Add event listeners to view details buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => showRecipeDetails(button.dataset.id));
    });
}

function showRecipeDetails(recipeId) {
    const recipe = allRecipes.find(r => r.id === parseInt(recipeId));
    if (recipe) {
        recipeDetails.innerHTML = `
            <h2>${recipe.title}</h2>
            <p>${recipe.description}</p>
            <h3>Ingredients:</h3>
            <ul>
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <h3>Steps:</h3>
            <ol>
                ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
            <button id="back-to-list">Back to List</button>
        `;
        recipesContainer.style.display = 'none';
        recipeDetails.style.display = 'block';

        document.getElementById('back-to-list').addEventListener('click', () => {
            recipesContainer.style.display = 'block';
            recipeDetails.style.display = 'none';
        });
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredRecipes = allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) || 
        recipe.description.toLowerCase().includes(searchTerm)
    );
    displayRecipes(filteredRecipes);
}

function showRecipesList(e) {
    e.preventDefault();
    recipesList.style.display = 'block';
    addRecipeForm.style.display = 'none';
    fetchRecipes();
}

function showAddRecipeForm(e) {
    e.preventDefault();
    recipesList.style.display = 'none';
    addRecipeForm.style.display = 'block';
}

async function handleAddRecipe(e) {
    e.preventDefault();
    const formData = new FormData(recipeForm);
    const newRecipe = {
        title: formData.get('title'),
        description: formData.get('description'),
        ingredients: formData.get('ingredients') ? formData.get('ingredients').split(',').map(item => item.trim()) : [],
        steps: formData.get('steps') ? formData.get('steps').split('\n').map(item => item.trim()) : [],
    };

    // Validate the newRecipe object
    if (!newRecipe.title || !newRecipe.description || newRecipe.ingredients.length === 0 || newRecipe.steps.length === 0) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRecipe),
        });

        if (!response.ok) {
            throw new Error('Failed to add recipe');
        }

        recipeForm.reset();
        showRecipesList(e);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add recipe. Please try again.');
    }
}

// Initial load
fetchRecipes();
