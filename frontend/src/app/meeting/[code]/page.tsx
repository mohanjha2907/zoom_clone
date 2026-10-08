import MeetingRoom from '@/components/MeetingRoom';

export default function MeetingPage({ params }: { params: { code: string } }) {
  return <MeetingRoom code={params.code} />;
}
