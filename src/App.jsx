import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from 'solid-markdown';
import * as Sentry from '@sentry/browser';
import { saveAs } from 'file-saver';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [uploadedFile, setUploadedFile] = createSignal(null);
  const [highlightedWords, setHighlightedWords] = createSignal([]);
  const [vocabularyList, setVocabularyList] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [dictionaryData, setDictionaryData] = createSignal({});
  const [note, setNote] = createSignal('');
  const [filter, setFilter] = createSignal('');
  const [sortCriteria, setSortCriteria] = createSignal('date');

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(() => {
    checkUserSignedIn();
    Sentry.configureScope(scope => {
      scope.setUser({ email: user()?.email, id: user()?.id });
    });
  });

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.data?.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const handleFileUpload = async (e) => {
    setLoading(true);
    try {
      const file = e.target.files[0];
      setUploadedFile(file);

      const { data: { session } } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploadFile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

    } catch (error) {
      console.error('File upload error:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVocabularyList = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/getVocabulary', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVocabularyList(data);
      } else {
        throw new Error('Error fetching vocabulary');
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const saveWord = async (word) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const definitionData = await fetchDefinition(word);

      const response = await fetch('/api/saveWord', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, ...definitionData }),
      });

      if (response.ok) {
        const savedWord = await response.json();
        setVocabularyList([...vocabularyList(), savedWord]);
      } else {
        throw new Error('Error saving word');
      }
    } catch (error) {
      console.error('Error saving word:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefinition = async (word) => {
    try {
      const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${import.meta.env.VITE_MERRIAM_WEBSTER_API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.shortdef) {
          return {
            definition: data[0].shortdef.join('; '),
            partOfSpeech: data[0].fl,
            example: data[0].def[0].sseq[0][0][1]?.dt[1]?.[1],
          };
        }
      }
    } catch (error) {
      console.error('Error fetching definition:', error);
      Sentry.captureException(error);
    }
    return { definition: 'Definition not found' };
  };

  const handleDownloadVocabulary = () => {
    const content = vocabularyList().map(word => {
      return `Word: ${word.word}\nDefinition: ${word.definition}\nPart of Speech: ${word.partOfSpeech}\nExample: ${word.example}\nNote: ${word.note}\n\n`;
    }).join('');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'vocabulary.txt');
  };

  const deleteWord = async (id) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/deleteWord', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setVocabularyList(vocabularyList().filter(word => word.id !== id));
      } else {
        throw new Error('Error deleting word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const sortedVocabulary = () => {
    let list = [...vocabularyList()];
    if (sortCriteria() === 'date') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortCriteria() === 'word') {
      list.sort((a, b) => a.word.localeCompare(b.word));
    }
    if (filter()) {
      list = list.filter(word => word.word.toLowerCase().includes(filter().toLowerCase()));
    }
    return list;
  };

  createEffect(() => {
    if (user()) {
      fetchVocabularyList();
    }
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-purple-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center cursor-pointer"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-purple-600">New App</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-purple-600">Upload Document</h2>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent cursor-pointer box-border"
              />
              <Show when={loading()}>
                <p class="mt-2 text-purple-600">Uploading...</p>
              </Show>
              <Show when={uploadedFile()}>
                <p class="mt-2 text-green-600">File uploaded: {uploadedFile().name}</p>
              </Show>
            </div>

            <div class="col-span-1 md:col-span-2">
              <h2 class="text-2xl font-bold mb-4 text-purple-600">Document Reader</h2>
              <Show when={uploadedFile()} fallback={<p class="text-gray-600">No document uploaded.</p>}>
                <div class="bg-white p-4 rounded-lg shadow-md h-96 overflow-y-auto">
                  <DocViewer
                    documents={[{ uri: URL.createObjectURL(uploadedFile()) }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableHeader: true,
                      },
                    }}
                  />
                  {/* Implement highlight functionality and word extraction here */}
                </div>
              </Show>
            </div>
          </div>

          <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4 text-purple-600">Vocabulary List</h2>
            <div class="flex items-center mb-4">
              <input
                type="text"
                placeholder="Filter words..."
                value={filter()}
                onInput={(e) => setFilter(e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
              />
              <select
                value={sortCriteria()}
                onChange={(e) => setSortCriteria(e.target.value)}
                class="ml-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="word">Sort by Word</option>
              </select>
            </div>
            <div class="space-y-4">
              <For each={sortedVocabulary()}>
                {(word) => (
                  <div class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="font-semibold text-lg text-purple-600 mb-2">{word.word}</p>
                        <p class="text-gray-700">{word.definition}</p>
                        <Show when={word.partOfSpeech}>
                          <p class="text-gray-500 italic">Part of Speech: {word.partOfSpeech}</p>
                        </Show>
                        <Show when={word.example}>
                          <p class="text-gray-500">Example: {word.example}</p>
                        </Show>
                        <Show when={word.note}>
                          <p class="text-gray-500">Note: {word.note}</p>
                        </Show>
                      </div>
                      <button
                        class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer h-full"
                        onClick={() => deleteWord(word.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="mt-4">
              <button
                onClick={handleDownloadVocabulary}
                class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              >
                Download Vocabulary List
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;