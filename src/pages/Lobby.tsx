import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { Users, Plus, Play, LogOut, Copy, Check, Activity } from 'lucide-react';

export function Lobby() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [gameType, setGameType] = useState('prisoners_dilemma');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [totalRounds, setTotalRounds] = useState(1);
  const [customOptionA, setCustomOptionA] = useState('Option A');
  const [customOptionB, setCustomOptionB] = useState('Option B');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const userId = localStorage.getItem('strategos_user_id');
  const username = localStorage.getItem('strategos_username');
  
  const rooms = useQuery(api.rooms.getAvailableRooms);
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const addBot = useMutation(api.bots.addBotToRoom);

  const [botStrategy, setBotStrategy] = useState('Tit-for-Tat');

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
    }
  }, [userId, navigate]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !userId) return;
    
    try {
      let customRules;
      if (gameType === 'custom') {
        customRules = { optionA: customOptionA, optionB: customOptionB };
      }
      
      const roomId = await createRoom({ 
        roomName, 
        hostId: userId as any,
        gameType,
        maxPlayers,
        totalRounds,
        customRules
      });
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const copyInviteLink = (roomId: string) => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom({ roomId: roomId as any, userId: userId as any });
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
      // Fallback: If they were already in the room, just route there
      navigate(`/room/${roomId}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('strategos_user_id');
    localStorage.removeItem('strategos_username');
    navigate('/auth');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-12 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-jet-orange mb-2">
            <Users size={24} />
            <h1 className="text-3xl font-bold uppercase tracking-tighter leading-none">The_Lobby</h1>
          </div>
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Multiplayer Colosseum Area</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-[10px] font-mono text-white/60">
            ID: <span className="text-white font-bold">{username}</span>
          </div>
          <button onClick={logout} className="text-white/40 hover:text-red-400 transition-colors p-2 md:p-3 border border-white/10 md:border-transparent hover:border-red-400/30 rounded">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.03)]">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-jet-orange mb-4 md:mb-6 flex items-center gap-2">
              <Plus size={14} /> Create_Arena
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div className="space-y-4">
                <input 
                  type="text" 
                  required
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 p-4 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-jet-orange/50 transition-all duration-300"
                  placeholder="Sector Name..."
                />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-white/40">Game Theory Matrix</label>
                  <select 
                    value={gameType} 
                    onChange={e => setGameType(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 p-3 rounded-md text-sm font-mono focus:outline-none"
                  >
                    <option value="prisoners_dilemma">Prisoner's Dilemma</option>
                    <option value="stag_hunt">Stag Hunt</option>
                    <option value="commons">Tragedy of the Commons</option>
                    <option value="custom">Custom Modifiers</option>
                  </select>
                </div>

                {gameType === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={customOptionA} onChange={e => setCustomOptionA(e.target.value)} placeholder="Option 1" className="w-full bg-black/60 border border-white/10 p-2 text-xs font-mono rounded" />
                    <input type="text" value={customOptionB} onChange={e => setCustomOptionB(e.target.value)} placeholder="Option 2" className="w-full bg-black/60 border border-white/10 p-2 text-xs font-mono rounded" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-white/40">Max Combatants</label>
                    <select 
                      value={maxPlayers} 
                      onChange={e => setMaxPlayers(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 p-3 rounded-md text-sm font-mono focus:outline-none"
                    >
                      {[2, 3, 4, 10].map(n => <option key={n} value={n}>{n} Players</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-white/40">Total Rounds</label>
                    <select 
                      value={totalRounds} 
                      onChange={e => setTotalRounds(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 p-3 rounded-md text-sm font-mono focus:outline-none"
                    >
                      {[1, 3, 5, 10, 50].map(n => <option key={n} value={n}>{n} Round{n>1?'s':''}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full p-4 rounded-md bg-white text-black font-bold uppercase text-xs tracking-tight hover:bg-jet-orange hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,69,0,0.4)]"
              >
                Initialize
              </button>
            </form>
          </div>
          <div className="border border-white/10 bg-black/40 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.03)] flex-1 flex flex-col min-h-[300px] mt-8 md:mt-8">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-jet-orange mb-4 flex items-center gap-2">
              <Activity size={14} /> Global_Intelligence_Feed
            </h2>
            <div className="flex-1 bg-black/60 rounded-lg p-4 font-mono text-[9px] text-white/40 space-y-2 overflow-y-auto max-h-[200px]">
              <div>[SYSTEM]: UPLINK_ESTABLISHED...</div>
              <div>[SYSTEM]: SCANNING_SECTORS_FOR_LIFE_SIGNS...</div>
              <div>[INTEL]: AGENT_ALPHA_JOINED_SECTOR_01</div>
              <div>[META]: CALIBRATING_RESONANCE_FLUX...</div>
              <div className="text-jet-orange animate-pulse">[!] STANDBY: AWAITING_NEW_DATA_PACKETS...</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
            <Play size={14} /> Available_Sectors
          </h2>
          
          <div className="space-y-2">
            {!rooms && (
              <div className="text-xs font-mono text-white/20 p-4 border border-white/5">Scanning frequencies...</div>
            )}
            {rooms && rooms.length === 0 && (
              <div className="text-xs font-mono text-white/20 p-4 border border-white/5 uppercase">No sectors currently awaiting combatants.</div>
            )}
            {rooms && rooms.map((room: any) => (
              <div key={room._id} className="p-4 md:p-6 border border-white/10 rounded-xl hover:border-jet-orange/50 bg-black/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,69,0,0.1)] hover:-translate-y-1">
                <div className="flex-1 w-full">
                  <div className="font-bold text-lg uppercase tracking-tight mb-2 group-hover:text-jet-orange transition-colors">{room.roomName}</div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-white/40">
                    <div className="flex flex-col gap-1 min-w-[100px]">
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter">
                        <span>Combatants</span>
                        <span>{room.players.length}/{room.maxPlayers}</span>
                      </div>
                      <div className="progress-bar-segment">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${(room.players.length / room.maxPlayers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="border border-white/10 px-2 py-1 bg-black/50 rounded">
                      {room.gameType.replace('_', ' ')}
                    </span>
                    <span className="border border-white/10 px-2 py-1 bg-black/50 rounded">
                      ROUNDS: {room.totalRounds}
                    </span>
                  </div>
                  {room.hostId === userId && room.players.length < (room.maxPlayers ?? 2) && (
                    <div className="flex items-center gap-2 mt-4">
                      <select 
                        value={botStrategy}
                        onChange={(e) => setBotStrategy(e.target.value)}
                        className="bg-jet-orange/10 border border-jet-orange/30 text-[9px] font-mono text-jet-orange p-1 rounded focus:outline-none"
                      >
                        {['Tit-for-Tat', 'Machiavelli', 'Altruist', 'Random'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button 
                        onClick={() => addBot({ roomId: room._id, strategy: botStrategy })}
                        className="text-[9px] font-bold uppercase tracking-tighter bg-jet-orange text-white px-2 py-1 rounded hover:bg-white hover:text-black transition-all"
                      >
                        + INJECT_AGENT
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => copyInviteLink(room._id)}
                    className="p-3 border border-white/20 rounded-md text-white/60 hover:text-white hover:border-white transition-all flex item-center justify-center shrink-0"
                    title="Copy Invite Link"
                  >
                    {copiedId === room._id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => handleJoinRoom(room._id)}
                    className="flex-1 md:flex-none px-8 py-3 rounded-md border border-white/20 text-xs font-bold uppercase tracking-tighter hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
