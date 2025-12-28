"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { User, Play, Music, Trophy, CheckCircle2 } from "lucide-react";

export default function GameRoom() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("player");
  const { data: session } = useSession();
  const [room, setRoom] = useState(null);
  const [guessed, setGuessed] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoom(data);
        
        // Check if user is host
        if (session?.user?.email === data.hostId) {
          setIsHost(true);
        }

        // Add player to list if joining for the first time
        if (playerName && !data.players.find(p => p.name === playerName)) {
          updateDoc(doc.ref, {
            players: arrayUnion({ name: playerName, id: Math.random().toString(36).substr(2, 9), score: 0 })
          });
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerName, session]);

  const startGame = async () => {
    const roomRef = doc(db, "rooms", roomId);
    // In a real app, fetch host's actual Spotify tracks here via API
    await updateDoc(roomRef, { 
      status: "playing",
      currentRound: 1,
      currentTrack: {
        name: "Unknown Track",
        artist: "Unknown Artist",
        preview_url: null, // Host would play via Spotify SDK/Connect
        owner: room.players[Math.floor(Math.random() * room.players.length)].name
      }
    });
  };

  const submitGuess = async (ownerName) => {
    if (guessed) return;
    setGuessed(true);
    
    if (ownerName === room.currentTrack.owner) {
      // Logic for adding points to player
      alert("Correct!");
    } else {
      alert(`Wrong! It was ${room.currentTrack.owner}'s song.`);
    }
  };

  if (!room) return <div className="flex items-center justify-center min-h-screen">Loading Party...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 pt-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Room Code</h2>
          <p className="text-3xl font-mono font-black text-[#1DB954]">{roomId}</p>
        </div>
        <div className="text-right">
          <h2 className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Status</h2>
          <p className="font-bold capitalize">{room.status}</p>
        </div>
      </header>

      {room.status === "waiting" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-[#1DB954]" /> Players Joined ({room.players.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {room.players.map((p, i) => (
                <div key={i} className="bg-zinc-800/50 p-3 rounded-xl flex items-center gap-3 border border-zinc-700/50">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                    {p.name[0]}
                  </div>
                  <span className="font-medium">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button onClick={startGame} className="spotify-button w-full">
              <Play fill="currentColor" size={20} />
              Start the Game
            </button>
          ) : (
            <div className="text-center p-8 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
              <p className="text-zinc-400">Waiting for {room.hostName} to start...</p>
            </div>
          )}
        </div>
      )}

      {room.status === "playing" && (
        <div className="space-y-8 text-center animate-in zoom-in-95 duration-300">
          <div className="relative aspect-square max-w-[300px] mx-auto">
            <div className="absolute inset-0 bg-[#1DB954] rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-zinc-900 w-full h-full rounded-2xl border border-zinc-700 flex flex-col items-center justify-center gap-4">
              <Music size={64} className="text-[#1DB954]" />
              <p className="font-bold text-xl">Music Playing...</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-black italic uppercase">Whose song is this?</h3>
            <div className="grid grid-cols-2 gap-4">
              {room.players.map((p, i) => (
                <button
                  key={i}
                  disabled={guessed}
                  onClick={() => submitGuess(p.name)}
                  className={`p-4 rounded-xl border font-bold transition-all ${
                    guessed 
                    ? 'bg-zinc-800 border-zinc-700 opacity-50' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-[#1DB954] hover:bg-zinc-800 active:scale-95'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {room.status === "finished" && (
        <div className="text-center space-y-6">
          <Trophy size={80} className="mx-auto text-yellow-500" />
          <h1 className="text-4xl font-black">Game Over!</h1>
          <div className="glass-card">
             {/* Scoreboard logic would go here */}
          </div>
        </div>
      )}
    </div>
  );
}
