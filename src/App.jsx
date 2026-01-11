import { useState, useEffect, useRef } from "react";
import he from "he";
import "./App.css";
import clsx from "clsx";
import yellow from "./assets/blue.png";
import blue from "./assets/yellow.png";
function App() {
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const score = useRef(0);
  useEffect(() => {
    if (showWarning) {
      const t = setTimeout(() => setShowWarning(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showWarning]);
  function onSubmission(formData) {
    if (answers.length) {
      fetchQuestions();
      setAnswers([]);
      setCount([]);
      score.current = 0;
      return;
    }

    const ans = [];
    for (let i = 0; i < questions.length; i++) {
      const userAnswer = formData.get(`q${i + 1}`);
      score.current =
        userAnswer === questions[i].correct_answer
          ? score.current + 1
          : score.current;
      ans.push(userAnswer);
    }
    setAnswers(ans);
  }

  // Fetch Questions from API
  function fetchQuestions() {
    setLoading(true);
    fetch("https://opentdb.com/api.php?amount=5&category=9&difficulty=easy")
      .then((res) => res.json())
      .then((data) => {
        if (data.response_code === 5) throw new Error("No Results");
        setQuestions(
          data.results.map((question) => {
            let options = shuffle([
              ...question.incorrect_answers,
              question.correct_answer,
            ]);

            return {
              question: question.question,
              correct_answer: question.correct_answer,
              options: options,
            };
          })
        );
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  const questionElements = questions.map((question, index) => {
    return (
      <div className="question">
        <h3>{he.decode(question.question)}</h3>
        <fieldset>
          {question.options.map((option) => {
            const key = `${index}-${option}`;
            const correct =
              answers.length && option === question.correct_answer;
            const wrong =
              answers.length &&
              option !== question.correct_answer &&
              option === answers[index];
            const labelClass = clsx("option", {
              disabled: answers.length,
              correct,
              wrong,
            });
            return (
              <label key={key} className={labelClass}>
                <input
                  type="radio"
                  name={`q${index + 1}`}
                  value={he.decode(option)}
                  disabled={answers.length}
                  onChange={() =>
                    setCount((prev) =>
                      prev.includes(index) ? prev : [...prev, index]
                    )
                  }
                />
                {he.decode(option)}
              </label>
            );
          })}
        </fieldset>
        <hr className="divider" />
      </div>
    );
  });

  function shuffle(arr) {
    const array = [...arr]; // copy so original is not mutated

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }
  return (
    <>
      {!loading && !questions.length && (
        <div className="page1">
          <h1>Quizzical</h1>
          <p>Let's test your knowledge!</p>
          <button onClick={fetchQuestions}>Start quiz</button>
        </div>
      )}
      {loading && (
        <div className="page2">
          <div className="loader">
            <div className="spinner"></div>
          </div>
        </div>
      )}
      {questions.length && (
        <div className="page2">
          <form action={onSubmission}>
            {questionElements}

            {answers.length === 0 && (
              <div
                onClick={() => {
                  if (count.length < 5) setShowWarning(true);
                }}
              >
                <button disabled={count.length >= 5 ? false : true}>
                  Check answers
                </button>
                {showWarning && count.length < 5 && (
                  <p className="warning">Please answer all questions first</p>
                )}
              </div>
            )}
            {answers.length > 0 && (
              <div className="result">
                <span>{`You scored ${score.current}/5 correct answers`}</span>
                <button>Play again</button>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}

export default App;
