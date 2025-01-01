document.addEventListener('DOMContentLoaded', () => {
    const addBoardBtn = document.getElementById('addBoard'); // Button to add boards
    const mainContainer = document.querySelector('.login-container'); // Parent container for boards

    // Add a new board when the button is clicked
    addBoardBtn.addEventListener('click', () => {
        const board = document.createElement('div');
        board.classList.add('board');
        board.style.width = '200px';
        board.style.height = '200px';
        board.style.position = 'absolute';
        board.style.backgroundColor = 'white';
        board.style.border = '1px solid black';
        board.style.top = '50px';
        board.style.left = '50px';

        // Enable dragging and resizing for the board
        makeDraggable(board);
        makeResizable(board);

        mainContainer.appendChild(board);
    });

    // Function to enable dragging
    function makeDraggable(element) {
        let offsetX = 0, offsetY = 0, isDragging = false;

        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resizer')) return; // Ignore drag when resizing
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            element.style.zIndex = 1000; // Bring the element to the front
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Function to enable resizing
    function makeResizable(element) {
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        resizer.style.width = '10px';
        resizer.style.height = '10px';
        resizer.style.background = 'gray';
        resizer.style.position = 'absolute';
        resizer.style.bottom = '0';
        resizer.style.right = '0';
        resizer.style.cursor = 'se-resize';
    
        resizer.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            let prevX = e.clientX;
            let prevY = e.clientY;
    
            const mouseMoveHandler = (e) => {
                const rect = element.getBoundingClientRect();
    
                // Calculate the new width and height based on mouse movement
                const newWidth = rect.width + (e.clientX - prevX);
                const newHeight = rect.height + (e.clientY - prevY);
    
                // Ensure the board size does not go below the minimum size
                if (newWidth > 50) {
                    element.style.width = `${newWidth}px`;
                    prevX = e.clientX; // Update the previous X position
                }
                if (newHeight > 50) {
                    element.style.height = `${newHeight}px`;
                    prevY = e.clientY; // Update the previous Y position
                }
            };
    
            const mouseUpHandler = () => {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };
    
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    
        element.appendChild(resizer);
    }
    });
