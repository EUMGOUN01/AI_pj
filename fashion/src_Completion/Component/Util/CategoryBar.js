// components/CategoryBar.js
const CategoryBar = ({ categories, selectedCategory, onSelectCategory }) => (
    <div className="category-bar">
        {categories.map((category) => (
            <span
                key={category.en}
                className={`category-item ${selectedCategory === category.ko ? 'active' : ''}`}
                onClick={() => onSelectCategory(category.ko)}
            >
                {category.ko} / {category.en}
            </span>
        ))}
    </div>
);

export default CategoryBar;
