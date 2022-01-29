'use strict';

import {
  ANSWERS_LIST_ID,
  USER_INTERFACE_ID,
  FIFTY_BUTTON_ID,
  TIMER_INTERFACE_TEXT_ID,
} from '../constants.js';
import { getQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { quizData } from '../data.js';
import { initProcess } from '../views/processView.js';
import { initGameOverPage } from './gameOverPage.js';
import { initTimeOutPage } from './timeOutPage.js';
import { initBreakpointPage } from './breakpointPage.js';
import { initFinishPage } from './finishPage.js';
import { getFiftyFiftyElement } from '../views/helpView.js';
import { initTimer } from '../views/timerView.js';
let a;

export const initQuestionPage = () => {
  const currentQuestion = getCurrentQuestion();
  shuffleAnswers(currentQuestion);
  const userInterface = document.getElementById(USER_INTERFACE_ID);

  const fiftyFiftyElement = getFiftyFiftyElement();
  if (localStorage.getItem('fiftyFiftyIsUsed') === 'true') {
    fiftyFiftyElement.firstElementChild.disabled = true;
  }

  const timerAndHelperView = document.createElement('div');
  timerAndHelperView.classList.add('timer-helper-container');
  userInterface.appendChild(timerAndHelperView);
  timerAndHelperView.appendChild(fiftyFiftyElement);

  const timerElement = initTimer();
  timerAndHelperView.appendChild(timerElement);
  getTimer(30);

  const questionElement = getQuestionElement(currentQuestion.text);
  userInterface.appendChild(questionElement);

  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText);
    answersListElement.appendChild(answerElement);
  }

  const process = initProcess();
  userInterface.appendChild(process);

  const inputs = document.getElementsByTagName('label');
  Array.from(inputs).forEach((input) => {
    input.addEventListener('click', (e) => {
      IsAnswerRight(e);
      nextQuestion(e);
      clearInterval(a);
      stopTimerAnimation();
      playAudio('select');
    });
  });

  const buttonElement = document.getElementById(FIFTY_BUTTON_ID);
  buttonElement.addEventListener('click', fiftyFifty);
};

const IsAnswerRight = (e) => {
  const answerList = document.querySelectorAll('.answer-list-item');
  Array.from(answerList).forEach((answer) => {
    answer.classList.add('pointer-none');
  });

  setTimeout(() => {
    const currentQuestion = getCurrentQuestion();
    setTimeout(() => {
      const rightAnswer = document.getElementById(currentQuestion.correct)
        .nextElementSibling;
      rightAnswer.style.backgroundColor = 'green';
      e.target.previousElementSibling.id !== currentQuestion.correct
        ? playAudio('wrong')
        : playAudio('right');
    }, 200);
    if (e.target.previousElementSibling.id !== currentQuestion.correct) {
      e.target.style.backgroundColor = 'red';
    }
  }, 2000);
};

const playAudio = (e) => {
  const right = new Audio('../../public/assets/sounds/correct_answer.mp3');
  const wrong = new Audio('../../public/assets/sounds/wrong_answer.mp3');
  const waiting = new Audio('../../public/assets/sounds/waiting_answer.mp3');

  if (e === 'select') {
    waiting.play();
    setTimeout(() => {
      waiting.pause();
    }, 2000);
  }
  if (e === 'right') {
    right.play();
    setTimeout(() => {
      right.pause();
    }, 3200);
  }
  if (e === 'wrong') {
    right.pause();
    wrong.play();
  }
};

export const getCurrentQuestion = () => {
  const order = localStorage.getItem('ids').split(',');
  const newIndex = parseInt(order[quizData.currentQuestionIndex]);
  return quizData.questions.filter((item) => item.id === newIndex)[0];
};

const nextQuestion = (e) => {
  const currentQuestion = getCurrentQuestion();
  const userInterfaceElement = document.getElementById(USER_INTERFACE_ID);
  if (e.target.previousElementSibling.id === currentQuestion.correct) {
    setTimeout(() => {
      if (
        quizData.currentQuestionIndex + 1 === 5 ||
        quizData.currentQuestionIndex + 1 === 10
      ) {
        userInterfaceElement.innerHTML = '';
        initBreakpointPage(quizData.currentQuestionIndex + 1);
      } else if (quizData.currentQuestionIndex + 1 === 15) {
        userInterfaceElement.innerHTML = '';
        initFinishPage(quizData.currentQuestionIndex + 1);
      } else {
        quizData.currentQuestionIndex = quizData.currentQuestionIndex + 1;
        userInterfaceElement.innerHTML = '';
        initQuestionPage();
      }
    }, 5000);
  } else {
    setTimeout(() => {
      userInterfaceElement.innerHTML = '';
      initGameOverPage();
    }, 5000);
  }
};

const fiftyFifty = () => {
  const curQuestion = getCurrentQuestion();
  const allAnswers = ['a', 'b', 'c', 'd'];
  const wrongAnswers = collect(allAnswers)
    .reject((answer) => answer == curQuestion.correct)
    .shuffle()
    .slice(0, 2)
    .each((answer) => {
      const nextElement = document
        .getElementById(answer)
        .nextElementSibling.classList.add('wrong-answer');
    });
  const button = document.getElementById(FIFTY_BUTTON_ID);
  button.disabled = true;
  localStorage.setItem('fiftyFiftyIsUsed', 'true');
};

const shuffleAnswers = (question) => {
  const correctVal = question.answers[question.correct];
  const shuffledValues = collect(Object.values(question.answers)).shuffle();

  question.answers = {
    a: shuffledValues.items[0],
    b: shuffledValues.items[1],
    c: shuffledValues.items[2],
    d: shuffledValues.items[3],
  };

  for (const [key, value] of Object.entries(question.answers)) {
    if (value === correctVal) {
      question.correct = key;
    }
  }
  return question;
};

const getTimer = (time) => {
  a = setInterval(timer, 1000);
  const timeDiv = document.getElementById(TIMER_INTERFACE_TEXT_ID);
  function timer() {
    timeDiv.textContent = time;
    time--;
    if (time < 9) {
      let number = timeDiv.textContent;
      timeDiv.textContent = `0${number}`;
    }
    if (time < 0) {
      clearInterval(a);
      timeDiv.textContent = '00';
      initTimeOutPage();
    }
  }
};

const stopTimerAnimation = () => {
  const timeDiv = document.getElementById(TIMER_INTERFACE_TEXT_ID);
  timeDiv.style.animation = 'none';
};
