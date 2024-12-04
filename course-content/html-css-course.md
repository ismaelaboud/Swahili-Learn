# Complete HTML & CSS Masterclass

## Course Details
{
  "title": "Complete HTML & CSS Masterclass",
  "description": "A comprehensive course taking you from absolute beginner to proficient in HTML and CSS. Learn modern web development practices and build real-world projects.",
  "category": "Web Development",
  "level": "Beginner",
  "prerequisites": ["Basic computer skills", "Text editor installed"],
  "duration": "6 weeks"
}

## Module 1: HTML Fundamentals

### Lesson 1: Introduction to HTML
{
  "type": "LECTURE",
  "title": "Introduction to HTML",
  "content": "<h2>What is HTML?</h2><p>HTML (HyperText Markup Language) is the standard markup language for web pages. It's the foundation of all web content and describes the structure of web pages using elements.</p>",
  "learningObjectives": [
    "Understand what HTML is and its role in web development",
    "Learn about web browsers and how they interpret HTML",
    "Set up your development environment"
  ],
  "keyPoints": [
    "HTML stands for HyperText Markup Language",
    "HTML is the standard markup language for web pages",
    "HTML describes the structure of web pages using elements"
  ],
  "codeExamples": [
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>My First Web Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>This is my first web page.</p>\n</body>\n</html>"
  ]
}

### Lesson 2: HTML Elements and Structure
{
  "type": "LECTURE",
  "title": "HTML Elements and Structure",
  "content": "<h2>Understanding HTML Elements</h2><p>HTML elements are the building blocks of web pages. They are represented by tags, which are surrounded by angle brackets.</p>",
  "learningObjectives": [
    "Learn about HTML elements and tags",
    "Understand document structure",
    "Master text formatting elements"
  ],
  "keyPoints": [
    "Elements are defined by tags",
    "Most elements have opening and closing tags",
    "Some elements are self-closing"
  ],
  "codeExamples": [
    "<article>\n    <h1>Main Heading</h1>\n    <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>\n    <img src=\"image.jpg\" alt=\"Description\" />\n</article>"
  ]
}

### Lesson 3: HTML Basics Quiz
{
  "type": "QUIZ",
  "title": "HTML Basics Quiz",
  "questions": [
    {
      "question": "What does HTML stand for?",
      "options": [
        "Hyper Transfer Markup Language",
        "HyperText Markup Language",
        "High-Level Text Markup Language",
        "Hybrid Text Markup Language"
      ],
      "correctAnswer": 1,
      "explanation": "HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages."
    },
    {
      "question": "Which tag is used for the largest heading?",
      "options": [
        "<h1>",
        "<heading>",
        "<head>",
        "<h6>"
      ],
      "correctAnswer": 0,
      "explanation": "The <h1> tag is used for the largest and most important heading in HTML."
    }
  ]
}

## Module 2: CSS Basics

### Lesson 1: Introduction to CSS
{
  "type": "LECTURE",
  "title": "Introduction to CSS",
  "content": "<h2>Understanding CSS</h2><p>CSS (Cascading Style Sheets) is the language used to style and layout web pages. It works hand in hand with HTML to create beautiful and responsive websites.</p>",
  "learningObjectives": [
    "Understand what CSS is and its purpose",
    "Learn different ways to add CSS to HTML",
    "Master basic CSS syntax"
  ],
  "keyPoints": [
    "CSS stands for Cascading Style Sheets",
    "CSS describes how HTML elements should be displayed",
    "CSS can be inline, internal, or external"
  ],
  "codeExamples": [
    "/* External CSS file */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n    font-size: 24px;\n}"
  ]
}

### Lesson 2: CSS Selectors
{
  "type": "LECTURE",
  "title": "CSS Selectors",
  "content": "<h2>Understanding CSS Selectors</h2><p>CSS selectors are used to target HTML elements and apply styles to them.</p>",
  "learningObjectives": [
    "Master different types of CSS selectors",
    "Understand selector specificity",
    "Learn to combine selectors"
  ],
  "keyPoints": [
    "CSS selectors target HTML elements",
    "Selectors can be combined for more specificity",
    "Selector specificity affects which styles are applied"
  ],
  "codeExamples": [
    "/* Element selector */\np {\n    color: #666;\n}\n\n/* Class selector */\n.highlight {\n    background-color: yellow;\n}\n\n/* ID selector */\n#header {\n    background-color: #f0f0f0;\n}\n\n/* Combination selector */\narticle p {\n    line-height: 1.6;\n}"
  ]
}

### Lesson 3: Build Your First Webpage
{
  "type": "EXERCISE",
  "title": "Build Your First Webpage",
  "instructions": [
    "Create an HTML file with proper document structure",
    "Add a main heading and three paragraphs",
    "Include an image with proper alt text",
    "Style your page using CSS"
  ],
  "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>My Web Page</title>\n    <style>\n        /* Add your CSS here */\n    </style>\n</head>\n<body>\n    <!-- Add your HTML here -->\n</body>\n</html>",
  "hints": [
    "Remember to use semantic HTML elements",
    "Don't forget to add alt text to your images",
    "Use CSS classes for reusable styles"
  ],
  "solution": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>My Web Page</title>\n    <style>\n        body { font-family: Arial, sans-serif; }\n        h1 { color: #333; }\n        img { max-width: 100%; }\n    </style>\n</head>\n<body>\n    <h1>Welcome to My Page</h1>\n    <img src=\"profile.jpg\" alt=\"Profile picture\">\n    <p>This is my first webpage!</p>\n</body>\n</html>"
}

## Module 3: Layout & Positioning

### Lesson 1: CSS Box Model
{
  "type": "LECTURE",
  "title": "CSS Box Model",
  "content": "<h2>The CSS Box Model</h2><p>Every element in web design is a rectangular box. The CSS box model describes how these rectangular boxes are generated and how they are laid out according to the visual formatting model.</p>",
  "learningObjectives": [
    "Understand the CSS box model",
    "Master margin, padding, and borders",
    "Learn about box-sizing"
  ],
  "keyPoints": [
    "Every element is a box",
    "The box model consists of: content, padding, border, and margin",
    "box-sizing affects how dimensions are calculated"
  ],
  "codeExamples": [
    ".box {\n    width: 200px;\n    padding: 20px;\n    border: 2px solid #333;\n    margin: 10px;\n    box-sizing: border-box;\n}"
  ]
}

## Module 4: Responsive Design

### Lesson 1: Media Queries
{
  "type": "LECTURE",
  "title": "Media Queries",
  "content": "<h2>Understanding Media Queries</h2><p>Media queries are used to apply different styles based on different screen sizes, devices, and orientations.</p>",
  "learningObjectives": [
    "Understand responsive web design principles",
    "Master media queries",
    "Learn mobile-first approach"
  ],
  "keyPoints": [
    "Media queries apply styles based on conditions",
    "Conditions can include screen size, device, and orientation",
    "Mobile-first approach prioritizes smaller screens"
  ],
  "codeExamples": [
    "/* Mobile first approach */\n.container {\n    width: 100%;\n    padding: 15px;\n}\n\n/* Tablet styles */\n@media screen and (min-width: 768px) {\n    .container {\n        width: 750px;\n        margin: 0 auto;\n    }\n}\n\n/* Desktop styles */\n@media screen and (min-width: 1024px) {\n    .container {\n        width: 960px;\n    }\n}"
  ]
}

## Module 5: Modern CSS

### Lesson 1: Flexbox
{
  "type": "LECTURE",
  "title": "Flexbox",
  "content": "<h2>Understanding Flexbox</h2><p>Flexbox is a layout mode that allows you to easily create flexible and responsive layouts.</p>",
  "learningObjectives": [
    "Master Flexbox layout",
    "Understand flex container and items",
    "Learn flex properties"
  ],
  "keyPoints": [
    "Flexbox is a layout mode",
    "Flex container and items are used to create layouts",
    "Flex properties control layout behavior"
  ],
  "codeExamples": [
    ".flex-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n.flex-item {\n    flex: 1;\n    margin: 10px;\n}"
  ]
}

## Module 6: CSS Grid

### Lesson 1: Grid Layout
{
  "type": "LECTURE",
  "title": "Grid Layout",
  "content": "<h2>Understanding Grid Layout</h2><p>Grid layout is a powerful layout system that allows you to easily create complex and responsive layouts.</p>",
  "learningObjectives": [
    "Master CSS Grid layout system",
    "Understand grid container and items",
    "Learn grid properties"
  ],
  "keyPoints": [
    "Grid layout is a powerful layout system",
    "Grid container and items are used to create layouts",
    "Grid properties control layout behavior"
  ],
  "codeExamples": [
    ".grid-container {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 20px;\n}\n\n.grid-item {\n    padding: 20px;\n    background-color: #f0f0f0;\n}"
  ]
}
