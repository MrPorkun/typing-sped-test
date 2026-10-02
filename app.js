let currentPassage = ''
let currentPassageId = ''
let elapsedSeconds = 0
let isRunning = false
const word = './data.json'

function addClass(element, className) {
    element.classList.add(className)
}

function removeClass(element, className) {
    element.classList.remove(className)
}

function getRandomWord() {
    return fetch(word)
        .then(Response => Response.json())
        .then(data => data)
}

async function getNextWord(selectedDifficulty) {
    const quote = await getRandomWord()

    const passages = quote[selectedDifficulty]
    const randomIndex = Math.floor(Math.random() * passages.length)
    const randomPassage = passages[randomIndex]

    currentPassageId = randomPassage.id
    currentPassage = randomPassage.text

    // ใน getNextWord
    const savedPersonalBest = localStorage.getItem('personalBest')
    personalBestValue.textContent = savedPersonalBest || '0'

    if (!isRunning) renderPreview()
}

const typingText = document.querySelector('#typing-text')
const startButton = document.querySelector('#start-typing')
const displayStart = document.querySelector('#display-start')
const typingInput = document.querySelector('#typing-input')
const accuracyStats = document.querySelector('#accuracy-stats')
const timeStats = document.querySelector('#time-stats')
const wpmStats = document.querySelector('#wpm-stats')
const displayCompleted = document.querySelector('#display-completed')
const displayFirstTyping = document.querySelector('#display-firsttyping')
const personalBestValue = document.querySelector('#personal-best-value')

const firstTypingWpm = document.querySelector('#display-firsttyping-wpm-result')
const firstTypingAccuracy = document.querySelector('#display-firsttyping-accuracy-result')
const firstTypingCorrect = document.querySelector(
    '#display-firsttyping-characters-correct'
)
const firstTypingIncorrect = document.querySelector(
    '#firsttyping-characters-incorrect'
)
const displayHighscore = document.querySelector('#display-highscore')

const highscoreWpm = document.querySelector('#display-highscore-wpm-result')
const highscoreAccuracy = document.querySelector(
    '#display-highscore-accuracy-result'
)
const highscoreCorrect = document.querySelector(
    '#display-highscore-characters-correct'
)
const highscoreIncorrect = document.querySelector(
    '#highscore-characters-incorrect'
)
const wpmResult = document.querySelector('#wpm-result')
const accuracyResult = document.querySelector('#accuracy-result')
const charactersCorrect = document.querySelector('#characters-correct')
const charactersIncorrect = document.querySelector('#characters-incorrect')
const typingArea = document.querySelector('.typing-area')
const starusanddifficulty = document.querySelector('.status-and-select-difficulty')
const restartButton = document.querySelector('#restart-test')
const goAgainButton = document.querySelector('#go-typing-again')
const firsttypingButton = document.querySelector('#firsttyping')
const beatThisScoreButton = document.querySelector('#beat-this-score')
const confettiContainer = document.querySelector('#confetti-container')


let timeLeft = 60
let timerId
let previousLength = 0
let mistakeCount = 0

typingText.addEventListener('click', () => {
    if (isRunning) typingInput.focus()
})

function renderPreview() {
    typingText.innerHTML = formatPassage(currentPassage)
    typingText.classList.add('blurred')
}

displayStart.addEventListener('click', startTest)

document.addEventListener('keydown', e => {
    if (isRunning) return
    if (e.target === startButton) return
    if (displayStart.classList.contains('hidden')) return
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return
    startTest()
})

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', async e => {
        await getNextWord(e.target.value)
        if (isRunning) startTest()
    })
})

document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', e => {
        if (isRunning) {
            startTest()
        } else {
            timeStats.textContent = e.target.value === 'timed' ? '0:60' : '0:00'
        }
    })
})

function startTest() {
    if (!currentPassage) return
    typingText.innerHTML = formatPassage(currentPassage)
    addClass(document.querySelector('.char'), 'current')
    displayStart.classList.add('hidden')
    typingInput.disabled = false
    typingInput.value = ''
    previousLength = 0
    typingInput.focus()
    mistakeCount = 0
    accuracyStats.textContent = '100%'
    clearInterval(timerId)
    const selectedMode = document.querySelector(
        'input[name="mode"]:checked'
    ).value
    elapsedSeconds = 0
    if (selectedMode === 'timed') {
        timeLeft = 60
        timeStats.textContent = '0:60'

        timerId = setInterval(() => {
            timeLeft -= 1
            elapsedSeconds += 1
            timeStats.textContent = `0:${String(timeLeft).padStart(2, '0')}`

            if (timeLeft === 0) {
                endTest()
            }
        }, 1000)
    } else {
        timeStats.textContent = formatTime(elapsedSeconds)

        timerId = setInterval(() => {
            elapsedSeconds += 1
            timeStats.textContent = formatTime(elapsedSeconds)
        }, 1000)
    }

    wpmStats.textContent = '0'
    typingArea.classList.remove('hidden')
    starusanddifficulty.classList.remove('hidden')
    restartButton.classList.remove('hidden')
    displayCompleted.classList.add('hidden')
    displayFirstTyping.classList.add('hidden')
    displayHighscore.classList.add('hidden')
    isRunning = true
    typingText.classList.remove('blurred')
    confettiContainer.classList.add('hidden')
    confettiContainer.innerHTML = ''
}

restartButton.addEventListener('click', async() => {
    const selectedDifficulty = document.querySelector(
        'input[name="difficulty"]:checked'
    ).value

    await getNextWord(selectedDifficulty)
    startTest()
})

goAgainButton.addEventListener('click', async() => {
    const selectedDifficulty = document.querySelector(
        'input[name="difficulty"]:checked'
    ).value

    await getNextWord(selectedDifficulty)
    startTest()
    typingInput.focus()
})

firsttypingButton.addEventListener('click', () => {
    startTest()
    typingInput.focus()
})

beatThisScoreButton.addEventListener('click', () => {
    startTest()
    typingInput.focus()
})

function formatPassage(passage) {
    return passage
        .split('')
        .map(character => {
            const visibleCharacter = character

            return `<span class="char">${visibleCharacter}</span>`
        })
        .join('')
}

typingInput.addEventListener('input', () => {
    const typedText = typingInput.value
    const typedCharacter = typedText[typedText.length - 1]
    const currentLetter = document.querySelector('.char.current')
    const expected = currentLetter.textContent


    if (typedText.length < previousLength) {
        // ผู้ใช้กด Backspace
        const previousLetter = currentLetter.previousElementSibling

        if (previousLetter) {
            removeClass(currentLetter, 'current')
            removeClass(previousLetter, 'correct')
            removeClass(previousLetter, 'incorrect')
            addClass(previousLetter, 'current')
        }
    } else {
        addClass(
            currentLetter,
            typedCharacter === expected ? 'correct' : 'incorrect'
        )

        if (typedCharacter !== expected) {
            mistakeCount += 1
        }

        removeClass(currentLetter, 'current')

        const nextLetter = currentLetter.nextElementSibling

        if (nextLetter) {
            addClass(nextLetter, 'current')
        }
    }

    const hasCurrentLetter = document.querySelector('.char.current')

    const correctCount = typingText.querySelectorAll('.char.correct').length

    const wpm = elapsedSeconds === 0 ?
        0 :
        Math.round((correctCount / 5) / (elapsedSeconds / 60))

    wpmStats.textContent = wpm

    const total = correctCount + mistakeCount
    const accuracy = total === 0 ? 100 : Math.round((correctCount / total) * 100)

    accuracyStats.textContent = `${accuracy}%`
    if (!hasCurrentLetter) {
        endTest()
    }
    previousLength = typedText.length
})

function endTest() {
    clearInterval(timerId)
    typingInput.disabled = true
    const correctCount = typingText.querySelectorAll('.char.correct').length

    const finalWpm = elapsedSeconds === 0 ?
        0 :
        Math.round((correctCount / 5) / (elapsedSeconds / 60))

    wpmResult.textContent = finalWpm
    accuracyResult.textContent = accuracyStats.textContent
    charactersCorrect.textContent = correctCount
    charactersIncorrect.textContent = mistakeCount
    const personalBestKey = 'personalBest'
    const savedPersonalBest = localStorage.getItem(personalBestKey)

    if (savedPersonalBest === null) {
        localStorage.setItem(personalBestKey, finalWpm)
        personalBestValue.textContent = finalWpm

        firstTypingWpm.textContent = finalWpm
        firstTypingAccuracy.textContent = accuracyStats.textContent
        firstTypingCorrect.textContent = correctCount
        firstTypingIncorrect.textContent = mistakeCount

        displayFirstTyping.classList.remove('hidden')
    } else if (finalWpm > Number(savedPersonalBest)) {
        localStorage.setItem(personalBestKey, finalWpm)
        personalBestValue.textContent = finalWpm

        highscoreWpm.textContent = finalWpm
        highscoreAccuracy.textContent = accuracyStats.textContent
        highscoreCorrect.textContent = correctCount
        highscoreIncorrect.textContent = mistakeCount

        displayHighscore.classList.remove('hidden')
        launchConfetti()
    } else {
        displayCompleted.classList.remove('hidden')
    }
    starusanddifficulty.classList.add('hidden')
    typingArea.classList.add('hidden')
    restartButton.classList.add('hidden')
    isRunning = false

}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function launchConfetti() {
    const colors = ['#4d8dff', '#e0556b', '#f0d958', '#5bd987', '#ffffff']
    confettiContainer.innerHTML = ''
    confettiContainer.classList.remove('hidden')

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('span')
        piece.className = 'confetti-piece'
        piece.style.left = Math.random() * 100 + '%'
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        piece.style.animationDelay = Math.random() * 0.8 + 's'
        piece.style.animationDuration = 2 + Math.random() * 1.5 + 's'
        confettiContainer.appendChild(piece)
    }

    setTimeout(() => confettiContainer.classList.add('hidden'), 4500)
}


getNextWord(
    document.querySelector('input[name="difficulty"]:checked').value
)