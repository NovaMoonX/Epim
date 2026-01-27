import { useState, useEffect } from 'react';
import { Input, Select, Accordion } from '@moondreamsdev/dreamer-ui/components';
import { db } from '@lib/firebase';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { FAQ, App } from '@lib/types';

export function KnowledgeBase() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load apps
      const appsSnapshot = await getDocs(collection(db, 'apps'));
      const appsData: App[] = [];
      appsSnapshot.forEach((doc) => {
        appsData.push({ id: doc.id, ...doc.data() } as App);
      });
      setApps(appsData);

      // Load FAQs
      const faqsSnapshot = await getDocs(collection(db, 'faqs'));
      const faqsData: FAQ[] = [];
      faqsSnapshot.forEach((doc) => {
        faqsData.push({ id: doc.id, ...doc.data() } as FAQ);
      });
      setFaqs(faqsData);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaqView = async (faqId: string) => {
    try {
      const faqRef = doc(db, 'faqs', faqId);
      await updateDoc(faqRef, {
        views: increment(1),
      });
    } catch (error) {
      console.error('Error updating FAQ views:', error);
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesApp = selectedApp === 'all' || faq.appId === selectedApp;

    return matchesSearch && matchesApp;
  });

  // Group FAQs by category
  const categorizedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);

    return acc;
  }, {} as Record<string, FAQ[]>);

  const appOptions = [
    { value: 'all', label: 'All Apps' },
    ...apps.map((app) => ({ value: app.id, label: app.name })),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-foreground/70 mb-6">
          Search our comprehensive FAQ section to find answers to common questions
        </p>

        <div className="space-y-4 mb-8">
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <Select
            options={appOptions}
            value={selectedApp}
            onChange={(value) => setSelectedApp(value)}
            placeholder="Filter by app"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading knowledge base...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-foreground/60">No articles found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(categorizedFaqs).map(([category, categoryFaqs]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {categoryFaqs.map((faq) => (
                    <Accordion.Item key={faq.id} value={faq.id}>
                      <Accordion.Trigger
                        onClick={() => handleFaqView(faq.id)}
                        className="text-left"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{faq.question}</span>
                          <span className="text-xs text-foreground/50 ml-2">
                            {faq.views} views
                          </span>
                        </div>
                      </Accordion.Trigger>
                      <Accordion.Content>
                        <div className="pt-2 pb-4 text-foreground/80 whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
