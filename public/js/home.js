const toggleSwitch = document.querySelector('#theme-switch');
const lightEmoji = document.querySelector('#light-emoji');
const darkEmoji = document.querySelector('#dark-emoji');

const updateTheme = () => {
    if (toggleSwitch.checked) {
        document.body.classList.add('dark-mode');
        lightEmoji.style.opacity = 0.3;
        darkEmoji.style.opacity = 1;
    } else {
        document.body.classList.remove('dark-mode');
        lightEmoji.style.opacity = 1;
        darkEmoji.style.opacity = 0.3;
    }
};


toggleSwitch.addEventListener('change', updateTheme);

updateTheme();
