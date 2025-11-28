// API service layer - connected to FastAPI backend
import type { Motion, MP, Vote, Speech, SpendingItem, TransparencyItem, PartyName } from '@/types';

const API_BASE = 'http://localhost:8000/api'; // root API path

// Motions API
export async function getMotions(): Promise<Motion[]> {
  const response = await fetch(`${API_BASE}/motions`);
  if (!response.ok) throw new Error('Failed to fetch motions');
  const data = await response.json();

  return data.map((m: any) => ({
    id: m.id.toString(),
    title: m.title,
    description: m.description || '',
    introducedBy: {
      mpId: m.introduced_by_mp_id.toString(),
      mpName: '', // Backend doesn't provide MP name
      party: m.introduced_by_party || ''
    },
    status: m.passed ? 'Passed' : 'In Progress',
    categories: m.categories || [],
    classification: m.classification,
    voteBreakdown: m.vote_results_by_party
      ? Object.entries(m.vote_results_by_party).map(([party, votes]: [string, any]) => ({
        party,
        yea: votes.yea || 0,
        nay: votes.nay || 0,
        abstain: votes.abstain || 0
      }))
      : [],
    date: m.date || new Date().toISOString().split('T')[0],
    upvotes: 0,
    downvotes: 0
  }));
}

export async function getMotionById(id: string): Promise<Motion | null> {
  const response = await fetch(`${API_BASE}/motions/${id}`);
  if (!response.ok) return null;
  const m = await response.json();

  return {
    id: m.id.toString(),
    title: m.title,
    description: m.description || '',
    introducedBy: {
      mpId: m.introduced_by_mp_id.toString(),
      mpName: '',
      party: m.introduced_by_party || ''
    },
    status: m.passed ? 'Passed' : 'In Progress',
    categories: m.categories || [],
    classification: m.classification,
    voteBreakdown: m.vote_results_by_party
      ? Object.entries(m.vote_results_by_party).map(([party, votes]: [string, any]) => ({
        party: party as PartyName,
        yea: votes.yea || 0,
        nay: votes.nay || 0,
        abstain: votes.abstain || 0
      }))
      : [],
    date: m.date || new Date().toISOString().split('T')[0],
    upvotes: 0,
    downvotes: 0
  };
}

export async function voteOnMotion(motionId: string, vote: 'up' | 'down'): Promise<void> {
  const response = await fetch(`${API_BASE}/motions/${motionId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mp_id: 1, // placeholder
      vote: vote === 'up' ? 'upvote' : 'downvote'
    })
  });
  if (!response.ok) throw new Error('Failed to vote on motion');
}

// MPs API
export async function getMPs(): Promise<MP[]> {
  const response = await fetch(`${API_BASE}/mps`);
  if (!response.ok) throw new Error('Failed to fetch MPs');
  const data = await response.json();

  return data.map((mp: any) => ({
    id: mp.id.toString(),
    name: mp.name,
    riding: mp.riding,
    party: mp.party as PartyName,
    imageUrl: mp.photo_url || '/placeholder.svg',
    attendanceRate: mp.attendance_rate || 0,
    partyLineVoting: mp.party_line_voting_rate || 0,
    yearsInOffice: mp.years_in_office || 0
  }));
}

export async function getMPById(id: string): Promise<MP | null> {
  const response = await fetch(`${API_BASE}/mps/${id}`);
  if (!response.ok) return null;
  const mp = await response.json();

  return {
    id: mp.id.toString(),
    name: mp.name,
    riding: mp.riding,
    party: mp.party as PartyName,
    imageUrl: mp.photo_url || '/placeholder.svg',
    attendanceRate: mp.attendance_rate || 0,
    partyLineVoting: mp.party_line_voting_rate || 0,
    yearsInOffice: mp.years_in_office || 0
  };
}

export async function searchMPs(query: string): Promise<MP[]> {
  const params = new URLSearchParams({ search: query });
  const response = await fetch(`${API_BASE}/mps?${params}`);
  if (!response.ok) throw new Error('Failed to search MPs');
  const data = await response.json();

  return data.map((mp: any) => ({
    id: mp.id.toString(),
    name: mp.name,
    riding: mp.riding,
    party: mp.party as PartyName,
    imageUrl: mp.photo_url || '/placeholder.svg',
    attendanceRate: mp.attendance_rate || 0,
    partyLineVoting: mp.party_line_voting_rate || 0,
    yearsInOffice: mp.years_in_office || 0
  }));
}

export async function getMPByPostalCode(postalCode: string): Promise<MP | null> {
  const response = await fetch(`${API_BASE}/lookup/postal-code/${postalCode}`);
  if (!response.ok) return null;
  const mp = await response.json();

  return {
    id: mp.id.toString(),
    name: mp.name,
    riding: mp.riding,
    party: mp.party as PartyName,
    imageUrl: mp.photo_url || '/placeholder.svg',
    attendanceRate: mp.attendance_rate || 0,
    partyLineVoting: mp.party_line_voting_rate || 0,
    yearsInOffice: mp.years_in_office || 0
  };
}

// Additional MP endpoints
export async function getMPVotes(mpId: string): Promise<Vote[]> {
  const response = await fetch(`${API_BASE}/mps/${mpId}/voting-record`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.map((v: any) => ({
    id: v.motion_id.toString(),
    motionId: v.motion_id.toString(),
    motionTitle: v.motion_title,
    vote: v.vote,
    date: '',
    matchedPartyLine: false,
    proposedByParty: 'Liberal' as PartyName,
    motionPassed: false
  }));
}

export async function getMPSpeeches(mpId: string): Promise<Speech[]> {
  const response = await fetch(`${API_BASE}/mps/${mpId}/speeches`);
  if (!response.ok) return [];
  return await response.json();
}

export async function getMPSpending(mpId: string): Promise<SpendingItem[]> {
  const response = await fetch(`${API_BASE}/mps/${mpId}/spending`);
  if (!response.ok) return [];
  const data = await response.json();
  const totalAmount = data.total_amount || 0;

  return data.entries?.map((e: any) => ({
    category: e.category,
    amount: e.amount,
    percentage: totalAmount > 0 ? (e.amount / totalAmount) * 100 : 0
  })) || [];
}

export async function getMPTransparency(mpId: string): Promise<TransparencyItem[]> {
  const response = await fetch(`${API_BASE}/mps/${mpId}/transparency`);
  if (!response.ok) return [];
  const data = await response.json();

  return data.entries?.map((e: any) => ({
    type: (e.registry_type || 'stock').toLowerCase() as 'stock' | 'conflict' | 'gift' | 'travel',
    description: e.details,
    date: e.filed_date
  })) || [];
}

