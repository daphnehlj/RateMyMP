import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MPHeader } from '@/components/MPHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MP, Vote, Speech, SpendingItem, TransparencyItem } from '@/types';
import { getMPById, getMPVotes, getMPSpeeches, getMPSpending, getMPTransparency } from '@/services/api';

export default function MPProfile() {
  const { mpId } = useParams<{ mpId: string }>();
  const [mp, setMP] = useState<MP | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [spending, setSpending] = useState<SpendingItem[]>([]);
  const [transparency, setTransparency] = useState<TransparencyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mpId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const mpData = await getMPById(mpId);
        if (mpData) setMP(mpData);

        const [votesData, speechesData, spendingData, transparencyData] = await Promise.all([
          getMPVotes(mpId),
          getMPSpeeches(mpId),
          getMPSpending(mpId),
          getMPTransparency(mpId),
        ]);

        setVotes(votesData);
        setSpeeches(speechesData);
        setSpending(spendingData);
        setTransparency(transparencyData);
      } catch (err) {
        console.error('Failed to fetch MP data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mpId]);

  if (!mp) return <div className="text-center py-12">Loading MP data...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-6">
        <MPHeader mp={mp} />

        <Tabs defaultValue="voting" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="voting">Voting Record</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="transparency">Transparency</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="space-y-4">
            {votes.length === 0 ? (
              <p className="text-muted-foreground">No voting record available</p>
            ) : (
              votes.map(vote => (
                <Card key={vote.id}>
                  <CardHeader>
                    <CardTitle>{vote.motionTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Vote: {vote.vote}</p>
                    <p>Matched Party Line: {vote.matchedPartyLine ? 'Yes' : 'No'}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {speeches.length === 0 ? (
              <p className="text-muted-foreground">No parliamentary activity available</p>
            ) : (
              speeches.map(speech => (
                <Card key={speech.id}>
                  <CardHeader>
                    <CardTitle>{speech.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{speech.content}</p>
                    <p className="text-sm text-muted-foreground">{speech.date}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="spending" className="space-y-4">
            {spending.length === 0 ? (
              <p className="text-muted-foreground">No spending data available</p>
            ) : (
              spending.map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{item.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Amount: ${item.amount}</p>
                    <p>Percentage: {item.percentage.toFixed(2)}%</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="transparency" className="space-y-4">
            {transparency.length === 0 ? (
              <p className="text-muted-foreground">No transparency records available</p>
            ) : (
              transparency.map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{item.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{item.description}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Email</div>
              <div className="text-foreground">{mp.email}</div>
            </div>
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Constituency Office</div>
              <div className="text-foreground">{mp.constituencyOffice}</div>
            </div>
            {mp.socialMedia && (
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Social Media</div>
                <div className="space-y-1">
                  {mp.socialMedia.twitter && <div className="text-foreground">{mp.socialMedia.twitter}</div>}
                  {mp.socialMedia.website && <div className="text-foreground">{mp.socialMedia.website}</div>}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
