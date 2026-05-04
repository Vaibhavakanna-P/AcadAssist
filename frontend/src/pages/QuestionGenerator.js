import React, { useState } from 'react';
import api from '../services/api';
import QuestionDisplay from '../components/QuestionDisplay';

const QuestionGenerator = () => {
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/questions/generate', { content, num_questions: 5 });
      setQuestions(res.data.questions);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">📝 Question Generator</h1>
        <form onSubmit={generate}>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows="6" className="input-field mb-4" placeholder="Paste study material here..." required />
          <button type="submit" className="btn-gradient w-full" disabled={loading}>{loading ? 'Generating...' : 'Generate Questions'}</button>
        </form>
        {questions.length > 0 && <div className="mt-6 space-y-4">{questions.map((q, i) => <QuestionDisplay key={i} question={q} index={i} />)}</div>}
      </div>
    </div>
  );
};

export default QuestionGenerator;
