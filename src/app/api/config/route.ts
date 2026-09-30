import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const fullConfig = getConfig();
  
  // Return only public fields (hide admin pin and secret tokens)
  const publicConfig = {
    partnerName: fullConfig.partnerName,
    invitationTitle: fullConfig.invitationTitle,
    invitationSubtitle: fullConfig.invitationSubtitle,
    letterGreeting: fullConfig.letterGreeting,
    letterBody: fullConfig.letterBody,
    availableDates: fullConfig.availableDates,
    availableTimes: fullConfig.availableTimes,
    activities: fullConfig.activities,
    foodOptions: fullConfig.foodOptions,
    showMusicPlayer: fullConfig.showMusicPlayer,
  };

  return NextResponse.json(publicConfig);
}
