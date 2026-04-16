import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, 
  User, 
  Drama, 
  Dumbbell, 
  Megaphone, 
  Music, 
  Camera, 
  ShoppingBag, 
  History, 
  TrendingUp, 
  DollarSign, 
  Smile, 
  Wind,
  Trophy,
  Clapperboard,
  ArrowRight,
  Heart,
  Users,
  Mic2,
  Move,
  Brain,
  Award as MedalIcon,
  Crown,
  Briefcase,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerStats, PlayerSkills, MovieProject, GameEvent, GameView, Relationship, CareerStage, ActorNPC, ProductionHouse, Agent, Award, Ending } from './types';
import { INITIAL_STATS, INITIAL_SKILLS, SAMPLE_PROJECTS, TRAINING_OPTIONS, FIRST_NAMES, LAST_NAMES, CAREER_STAGES, PRODUCTION_HOUSES, AVAILABLE_AGENTS, AWARD_CATEGORIES, CEREMONY_FREQUENCY, ENDING_SCENARIOS } from './constants';
import { generateMovieAudition, generateTabloidHeadlines } from './lib/gemini';

export default function App() {
  // Game State
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [skills, setSkills] = useState<PlayerSkills>(INITIAL_SKILLS);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [npcs, setNpcs] = useState<ActorNPC[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [nominatedProject, setNominatedProject] = useState<{title: string, category: string} | null>(null);
  const [selectedEnding, setSelectedEnding] = useState<Ending | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [view, setView] = useState<GameView>('dashboard');
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<MovieProject | null>(null);
  const [projectProgress, setProjectProgress] = useState(0);
  const [auditionScript, setAuditionScript] = useState<any>(null);
  const [pendingAuditionProject, setPendingAuditionProject] = useState<MovieProject | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const res = await generateTabloidHeadlines("Newcomer", 5);
      setHeadlines(res);
      
      // Starting relationships
      setRelationships([
        { id: '1', name: 'Mom', type: 'Family', level: 90, notoriety: 0, isPublic: false },
        { id: '2', name: `${FIRST_NAMES[0]} ${LAST_NAMES[0]}`, type: 'Friend', level: 50, notoriety: 10, isPublic: true }
      ]);

      // Generate 200 NPCs
      const generatedNpcs: ActorNPC[] = [];
      for (let i = 0; i < 200; i++) {
        const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const careerStage = CAREER_STAGES[Math.floor(Math.random() * 4)] as CareerStage;
        generatedNpcs.push({
          id: `npc-${i}`,
          name: `${fn} ${ln}`,
          fame: Math.floor(Math.random() * 100),
          careerStage,
          image: `actor-${i}`
        });
      }
      setNpcs(generatedNpcs);
    };
    init();
  }, []);

  // Helper: Format Money
  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Career Stage Progression
  const checkCareerProgression = useCallback(() => {
    let nextStage = stats.careerStage;
    if (stats.careerStage === 'Aspiring Actor' && stats.fame >= 25 && stats.money >= 5000) nextStage = 'Rising Star';
    else if (stats.careerStage === 'Rising Star' && stats.fame >= 60 && stats.money >= 100000) nextStage = 'Established Star';
    else if (stats.careerStage === 'Established Star' && stats.fame >= 95 && stats.money >= 5000000) nextStage = 'Legend';

    if (nextStage !== stats.careerStage) {
      setStats(prev => ({ ...prev, careerStage: nextStage }));
      addEvent("Career Level Up!", `You are now a ${nextStage}! New opportunities await.`, 'career', { happiness: 20 });
    }
  }, [stats.fame, stats.money, stats.careerStage]);

  // Logic: Add Event
  const addEvent = useCallback((title: string, description: string, type: GameEvent['type'] = 'random', impact?: Partial<PlayerStats & { skills: Partial<PlayerSkills> }>) => {
    const newEvent: GameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      type,
      day: stats.day,
      impact
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 10));
    
    if (impact) {
      if (impact.skills) {
        setSkills(prev => {
          const newSkills = { ...prev };
          Object.entries(impact.skills!).forEach(([key, val]) => {
            (newSkills as any)[key] = Math.max(0, (newSkills as any)[key] + (val as number));
          });
          return newSkills;
        });
      }

      setStats(prev => ({
        ...prev,
        fame: Math.max(0, Math.min(100, (prev.fame || 0) + (impact.fame || 0))),
        money: (prev.money || 0) + (impact.money || 0),
        stress: Math.max(0, Math.min(100, (prev.stress || 0) + (impact.stress || 0))),
        happiness: Math.max(0, Math.min(100, (prev.happiness || 0) + (impact.happiness || 0))),
        looks: Math.max(0, Math.min(100, (prev.looks || 0) + (impact.looks || 0))),
      }));
    }
  }, [stats.day]);

  // Daily processing logic used by nextDay and nextWeek
  const runDailyLogic = (currentStats: PlayerStats, currentRelationships: Relationship[], currentProj: MovieProject | null, projProgress: number, nominatedProj: any, currentSkills: PlayerSkills, currentAwards: Award[]) => {
    let statsUpdate = { ...currentStats };
    let relUpdate = [...currentRelationships];
    let projUpdate = currentProj ? { ...currentProj } : null;
    let progUpdate = projProgress;
    let awardsUpdate = [...currentAwards];
    let nominatedUpdate = nominatedProj ? { ...nominatedProj } : null;
    const newEvents: GameEvent[] = [];

    statsUpdate.day += 1;

    // Relationship decay
    relUpdate = relUpdate.map(rel => ({
      ...rel,
      level: Math.max(0, rel.level - (Math.random() > 0.8 ? 1 : 0))
    }));

    // Career Progress
    if (projUpdate) {
      if (progUpdate + 1 >= projUpdate.duration) {
        let finalPay = projUpdate.pay;
        let bonus = 0;
        let commission = 0;

        if (agent) {
          bonus = Math.floor(finalPay * (agent.negotiationSkill / 200));
          const payAfterBonus = finalPay + bonus;
          commission = Math.floor(payAfterBonus * agent.commissionRate);
          finalPay = payAfterBonus - commission;
        }

        newEvents.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'career',
          title: "Project Wrapped!",
          description: `Successfully finished filming "${projUpdate.title}". ${agent ? `(Bonus: ${formatMoney(bonus)}, Commission: ${formatMoney(commission)})` : ''}`,
          day: statsUpdate.day,
          impact: {
            fame: projUpdate.fameReward,
            money: finalPay,
            stress: 15
          }
        });

        const nominationChance = (currentSkills.acting / 100) * (projUpdate.budget === 'Prestige' ? 0.8 : projUpdate.budget === 'Blockbuster' ? 0.4 : 0.1);
        if (Math.random() < nominationChance) {
          const cat = AWARD_CATEGORIES[Math.floor(Math.random() * (AWARD_CATEGORIES.length - 1))];
          nominatedUpdate = { title: projUpdate.title, category: cat };
          newEvents.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'career',
            title: "Award Nomination!",
            description: `The industry is buzzing. You're nominated for "${cat}" for your role in "${projUpdate.title}"!`,
            day: statsUpdate.day,
            impact: { fame: 10, happiness: 15 }
          });
        }

        projUpdate = null;
        progUpdate = 0;
      } else {
        progUpdate += 1;
        newEvents.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'career',
          title: "On Set",
          description: `Another long day of filming "${projUpdate.title}".`,
          day: statsUpdate.day,
          impact: { stress: 10 }
        });
      }
    }

    // Award Ceremony
    if (statsUpdate.day % CEREMONY_FREQUENCY === 0) {
      if (nominatedUpdate) {
        const winChance = (currentSkills.acting / 100) * (statsUpdate.fame / 100) + 0.2;
        if (Math.random() < winChance) {
          const newAward: Award = {
            id: Math.random().toString(36).substr(2, 9),
            title: "The Gilded Clapper",
            category: nominatedUpdate.category,
            projectTitle: nominatedUpdate.title,
            day: statsUpdate.day
          };
          awardsUpdate.push(newAward);
          newEvents.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'career',
            title: "AWARD WINNER!",
            description: `The winner is... YOU! You won "${nominatedUpdate.category}" for "${nominatedUpdate.title}"!`,
            day: statsUpdate.day,
            impact: { fame: 50, happiness: 30, money: 5000 }
          });
          nominatedUpdate = null;
        } else {
          const winnerNpc = npcs[Math.floor(Math.random() * Math.min(npcs.length, 20))];
          if (winnerNpc) {
            const newRival: Relationship = {
              id: winnerNpc.id,
              name: winnerNpc.name,
              type: 'Rival',
              level: 0,
              notoriety: winnerNpc.fame,
              isPublic: true
            };
            if (!relUpdate.find(r => r.id === winnerNpc.id)) {
              relUpdate.push(newRival);
            }
            newEvents.push({
              id: Math.random().toString(36).substr(2, 9),
              type: 'career',
              title: "Awards Night",
              description: `You attended the ceremony, but "${nominatedUpdate.category}" went to ${winnerNpc.name}. A bitter rivalry begins.`,
              day: statsUpdate.day,
              impact: { stress: 20, happiness: -15, fame: 5 }
            });
          }
          nominatedUpdate = null;
        }
      } else if (statsUpdate.careerStage === 'Legend' && statsUpdate.day > 100 && Math.random() < 0.05) {
        const lifetimeAward: Award = {
          id: Math.random().toString(36).substr(2, 9),
          title: "Legacy Honor",
          category: "Lifetime Achievement Award",
          projectTitle: "A Lifetime of Excellence",
          day: statsUpdate.day
        };
        awardsUpdate.push(lifetimeAward);
        newEvents.push({
           id: Math.random().toString(36).substr(2, 9),
           type: 'career',
           title: "LEGACY HONORED",
           description: "You've been granted the Lifetime Achievement Award. Your name is etched in Hollywood history.",
           day: statsUpdate.day,
           impact: { fame: 80, happiness: 50 }
        });
      }
    }

    // Rivalry Impact
    const currentRivals = relUpdate.filter(r => r.type === 'Rival');
    if (currentRivals.length > 0) {
      statsUpdate.stress = Math.min(100, statsUpdate.stress + (currentRivals.length * 2));
      if (Math.random() < 0.1) {
        const activeRival = currentRivals[Math.floor(Math.random() * currentRivals.length)];
        newEvents.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'social',
          title: "Industry Sabotage",
          description: `${activeRival.name} is spreading rumors about your behavior on set. Production is concerned.`,
          day: statsUpdate.day,
          impact: { fame: -5, happiness: -10, stress: 15 }
        });
      }
    }

    // Final stat updates for the day
    statsUpdate.money -= (statsUpdate.careerStage === 'Legend' ? 200 : statsUpdate.careerStage === 'Established Star' ? 100 : 20);
    statsUpdate.stress = Math.max(0, statsUpdate.stress - 5);

    // Update stats with event impacts
    newEvents.forEach(ev => {
      if (ev.impact) {
        statsUpdate.fame = Math.max(0, Math.min(100, statsUpdate.fame + (ev.impact.fame || 0)));
        statsUpdate.money += (ev.impact.money || 0);
        statsUpdate.stress = Math.max(0, Math.min(100, statsUpdate.stress + (ev.impact.stress || 0)));
        statsUpdate.happiness = Math.max(0, Math.min(100, statsUpdate.happiness + (ev.impact.happiness || 0)));
      }
    });

    return { statsUpdate, relUpdate, projUpdate, progUpdate, awardsUpdate, nominatedUpdate, newEvents };
  };

  // Action: Next Day
  const nextDay = async () => {
    if (stats.day >= 200) {
      triggerEnding();
      return;
    }

    setLoading(true);
    if (Math.random() > 0.7) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
    }

    const result = runDailyLogic(stats, relationships, currentProject, projectProgress, nominatedProject, skills, awards);

    setStats(result.statsUpdate);
    setRelationships(result.relUpdate);
    setCurrentProject(result.projUpdate);
    setProjectProgress(result.progUpdate);
    setAwards(result.awardsUpdate);
    setNominatedProject(result.nominatedUpdate);
    
    setEvents(prev => [...result.newEvents, ...prev].slice(0, 50));

    if (result.statsUpdate.day % 3 === 0) {
      const hData = await generateTabloidHeadlines("You", result.statsUpdate.fame, result.relUpdate.filter(r => r.type === 'Rival').map(r => r.name));
      setHeadlines(hData);
    }

    setLoading(false);
    checkCareerProgression();
  };

  const nextWeek = async () => {
    if (stats.day + 7 > 204) { // slightly over 200 is fine before hard limit
       triggerEnding();
       return;
    }
    setLoading(true);

    let curS = { ...stats };
    let curR = [...relationships];
    let curP = currentProject;
    let curPr = projectProgress;
    let curN = nominatedProject;
    let curA = [...awards];
    const weeklyEvents: GameEvent[] = [];

    for (let i = 0; i < 7; i++) {
        const dayRes = runDailyLogic(curS, curR, curP, curPr, curN, skills, curA);
        curS = dayRes.statsUpdate;
        curR = dayRes.relUpdate;
        curP = dayRes.projUpdate;
        curPr = dayRes.progUpdate;
        curN = dayRes.nominatedUpdate;
        curA = dayRes.awardsUpdate;
        weeklyEvents.push(...dayRes.newEvents);
    }

    setStats(curS);
    setRelationships(curR);
    setCurrentProject(curP);
    setProjectProgress(curPr);
    setNominatedProject(curN);
    setAwards(curA);
    setEvents(prev => [...weeklyEvents, ...prev].slice(0, 50));

    const hData = await generateTabloidHeadlines("You", curS.fame, curR.filter(r => r.type === 'Rival').map(r => r.name));
    setHeadlines(hData);

    setLoading(false);
    checkCareerProgression();
  };

  // Action: Training
  const handleTrain = (option: any) => {
    if (stats.money < option.cost) return;
    addEvent(`Training: ${option.name}`, `You spent the afternoon sharpening your ${option.id}.`, 'life', {
      ...option.stats,
      money: -option.cost
    });
  };

  // Action: Audition
  const startAudition = async (project?: MovieProject) => {
    if (currentProject) {
      addEvent("Busy", "You are already committed to a project.", "life", { stress: 2 });
      return;
    }
    setLoading(true);
    const script = await generateMovieAudition(skills.acting, project?.title, project?.role);
    setAuditionScript(script);
    setPendingAuditionProject(project || null);
    setView('audition');
    setLoading(false);
  };

  const handleAuditionResult = (success: boolean) => {
    if (success) {
      let project = pendingAuditionProject;
      if (!project) {
        const available = SAMPLE_PROJECTS.filter(p => {
          if (p.requirements.fame && stats.fame < p.requirements.fame) return false;
          if (p.requirements.stage && CAREER_STAGES.indexOf(stats.careerStage) < CAREER_STAGES.indexOf(p.requirements.stage)) return false;
          return true;
        });
        project = available[Math.floor(Math.random() * available.length)] || SAMPLE_PROJECTS[0];
      }
      addEvent("Audition Success!", `You nailed it! You've been cast as ${project.role} in "${project.title}".`, 'career');
      setCurrentProject(project);
    } else {
      const luckyNpc = npcs[Math.floor(Math.random() * 50)];
      const newRival: Relationship = {
        id: luckyNpc.id,
        name: luckyNpc.name,
        type: 'Rival',
        level: 0,
        notoriety: luckyNpc.fame,
        isPublic: true
      };
      setRelationships(prev => {
        if (prev.find(r => r.id === luckyNpc.id)) return prev;
        return [...prev, newRival];
      });
      addEvent("Audition Rejected", `${luckyNpc.name} got the role instead. This is going to be personal.`, 'career', { happiness: -8, stress: 10 });
    }
    setView('dashboard');
    setAuditionScript(null);
    setPendingAuditionProject(null);
  };

  // Action: Socialize
  const socialize = (relId: string) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, level: Math.min(100, r.level + 10) } : r));
    addEvent("Caught Up", `Spent quality time with someone close to you.`, 'social', { happiness: 10, stress: -10 });
  };

  const findNewFriend = () => {
    if (stats.money < 100) return;
    const name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
    const newFriend: Relationship = {
      id: Math.random().toString(),
      name,
      type: 'Friend',
      level: 20,
      notoriety: Math.floor(Math.random() * stats.fame * 1.5),
      isPublic: true
    };
    setRelationships(prev => [...prev, newFriend]);
    addEvent("New Connection", `Met ${name} at a party. Potential networking opportunity?`, 'social', { money: -100, networking: 5 });
  };

  const hireAgent = (newAgent: Agent) => {
    if (stats.money < newAgent.costToHire) return;
    setAgent(newAgent);
    setStats(prev => ({ ...prev, money: prev.money - newAgent.costToHire }));
    addEvent("New Representation", `You are now represented by ${newAgent.name}.`, 'career', { happiness: 10 });
  };

  const fireAgent = () => {
    if (!agent) return;
    addEvent("Contract Terminated", `Parted ways with ${agent.name}.`, 'career', { happiness: -5 });
    setAgent(null);
  };

  const triggerEnding = useCallback(() => {
    let endingId = 'forgotten';
    
    const innerCircle = relationships.filter(r => r.type !== 'Rival');
    const avgHeartLevel = innerCircle.length > 0 ? innerCircle.reduce((acc, curr) => acc + curr.level, 0) / innerCircle.length : 0;

    if (stats.careerStage === 'Legend' && stats.fame > 90 && awards.length >= 3) {
      endingId = 'legend';
    } else if (stats.happiness > 80 && avgHeartLevel > 70 && stats.money > 100000) {
      endingId = 'happy-recluse';
    } else if (stats.fame > 70 && stats.stress > 80 && stats.happiness < 30) {
      endingId = 'tragic-star';
    } else if (stats.money > 1000000 && skills.networking > 80) {
      endingId = 'the-professional';
    } else if (stats.fame < 40 || stats.money < 5000) {
      endingId = 'forgotten';
    }

    const ending = ENDING_SCENARIOS.find(e => e.id === endingId);
    if (ending) {
      setSelectedEnding(ending as Ending);
      setView('ending');
    }
  }, [stats, awards, relationships, skills]);

  const retire = () => {
    if (window.confirm("Are you sure you want to retire? This will end your career and reveal your legacy.")) {
      triggerEnding();
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary overflow-x-hidden flex flex-col items-center">
      {showFlash && <div className="camera-flash opacity-50 animate-pulse" />}
      
      <div className="w-full app-grid border border-border-subtle bg-bg-deep mx-auto">
        {/* Header */}
        <header className="col-span-full bg-bg-elevated border-b border-border-subtle flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <div className="logo-font text-2xl uppercase font-bold tracking-widest text-gold italic">Cinestar</div>
            <div className="bg-gold/10 px-3 py-1 rounded-full border border-gold/20 flex items-center gap-2">
               {stats.careerStage === 'Legend' ? <Crown className="text-gold" size={14} /> : <Star className="text-gold" size={14} />}
               <span className="text-[10px] font-black uppercase text-gold tracking-widest">{stats.careerStage}</span>
            </div>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <p className="stat-label">Day</p>
              <p className="stat-value">{stats.day}</p>
            </div>
            <div className="text-center">
              <p className="stat-label">Balance</p>
              <p className="stat-value">{formatMoney(stats.money)}</p>
            </div>
            <div className="text-center">
              <p className="stat-label">Public Image</p>
              <p className="stat-value">{stats.fame > 80 ? 'Iconic' : stats.fame > 50 ? 'Well Known' : 'Unknown'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setView('dashboard')}
              className={`action-btn-styled text-[10px] ${view === 'dashboard' ? 'action-btn-primary' : ''}`}
            >
              STUDIO
            </button>
            <button 
              onClick={() => setView('management')}
              className={`action-btn-styled text-[10px] ${view === 'management' ? 'action-btn-primary' : ''}`}
            >
              SOCIAL
            </button>
            <button 
              onClick={() => setView('industry')}
              className={`action-btn-styled text-[10px] ${view === 'industry' ? 'action-btn-primary' : ''}`}
            >
              INDUSTRY
            </button>
            <button 
              onClick={() => setView('agency')}
              className={`action-btn-styled text-[10px] ${view === 'agency' ? 'action-btn-primary' : ''}`}
            >
              AGENCY
            </button>
            <button 
              onClick={() => setView('awards')}
              className={`action-btn-styled text-[10px] ${view === 'awards' ? 'action-btn-primary' : ''}`}
            >
              AWARDS
            </button>
            <button 
              onClick={nextDay}
              disabled={loading}
              className="action-btn-styled action-btn-primary flex items-center gap-2"
            >
              {loading ? '...' : 'NEXT DAY'} <ArrowRight size={14} />
            </button>
            <button 
              onClick={nextWeek}
              disabled={loading}
              className="action-btn-styled border-gold/40 text-gold flex items-center gap-2"
            >
              {loading ? '...' : 'NEXT WEEK'} <Star size={14} className="fill-gold" />
            </button>
          </div>
        </header>

        {/* Sidebar Left: Detailed Skills */}
        <aside className="bg-bg-elevated border-r border-border-subtle p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="portrait-box">
             <img 
               src={`https://picsum.photos/seed/${skills.acting}/200`} 
               alt="Actor Profile" 
               className="w-full h-full object-cover opacity-80"
               referrerPolicy="no-referrer"
             />
             <div className="absolute bottom-3 text-sm font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] uppercase">The Talent</div>
          </div>

          <div className="space-y-4">
            <h3 className="stat-label">Personal Well-being</h3>
            <StatBar label="Looks" value={stats.looks} />
            <StatBar label="Happiness" value={stats.happiness} />
            <StatBar label="Stress" value={stats.stress} isStress />
          </div>

          <div className="pt-6 border-t border-border-subtle space-y-4">
            <h3 className="stat-label">Professional Craft</h3>
            <SkillDisplay icon={<Drama />} label="Acting" value={skills.acting} />
            <SkillDisplay icon={<Mic2 />} label="Voice" value={skills.voice} />
            <SkillDisplay icon={<Move />} label="Movement" value={skills.movement} />
            <SkillDisplay icon={<Brain />} label="Improv" value={skills.improvisation} />
            <SkillDisplay icon={<TrendingUp />} label="Networking" value={skills.networking} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="p-10 flex flex-col gap-8 overflow-y-auto bg-bg-deep">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-8 h-full"
              >
                {/* Active Project Card */}
                <div className="active-project-card p-10 flex-shrink-0 flex flex-col justify-center items-center text-center relative group min-h-[300px]">
                  {currentProject ? (
                    <>
                      <p className="text-gold text-xs tracking-[0.3em] font-bold mb-2 uppercase">Production in Progress</p>
                      <h1 className="logo-font text-5xl text-white mb-4 italic leading-tight">{currentProject.title}</h1>
                      <div className="flex gap-4 mb-4">
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/50 uppercase">{currentProject.budget}</span>
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/50 uppercase">{currentProject.genre}</span>
                      </div>
                      <p className="text-text-muted italic text-sm max-w-md">Playing "{currentProject.role}". Every scene is a chance to define your legacy.</p>
                      
                      <div className="mt-10 w-full max-w-md">
                        <div className="flex justify-between text-[10px] text-text-muted uppercase mb-2">
                          <span>Progress to Wrap</span>
                          <span>{Math.round((projectProgress / currentProject.duration) * 100)}%</span>
                        </div>
                        <div className="bar-bg h-2">
                          <motion.div 
                            className="bar-fill" 
                            initial={{ width: 0 }} 
                            animate={{ width: `${(projectProgress / currentProject.duration) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gold text-xs tracking-[0.3em] font-bold mb-4 uppercase">Waiting for Opportunity</p>
                      <h1 className="logo-font text-4xl text-white/20 mb-6 italic">Idle on the Lot</h1>
                      <button 
                        onClick={startAudition}
                        disabled={loading}
                        className="action-btn-styled action-btn-primary"
                      >
                        {loading ? 'Consulting Agent...' : 'REQUEST CASTING CALL'}
                      </button>
                    </>
                  )}
                  {stats.day >= 50 && (
                    <button 
                      onClick={retire}
                      className="text-[10px] text-text-muted hover:text-red-500 font-bold uppercase tracking-widest transition-colors mt-4 self-center"
                    >
                      Retire Gracefully
                    </button>
                  )}
                  <Clapperboard className="absolute right-[-20px] bottom-[-20px] size-48 opacity-[0.03] rotate-12 pointer-events-none" />
                </div>

                {/* Training Grid */}
                <div>
                   <h3 className="stat-label mb-4">Development Workshops</h3>
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {TRAINING_OPTIONS.map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => handleTrain(opt)}
                          disabled={stats.money < opt.cost}
                          className="bg-bg-elevated border border-border-subtle p-5 rounded hover:border-gold/50 transition-all text-left flex flex-col gap-2 disabled:opacity-30 group"
                        >
                          <div className="p-2 bg-black/50 rounded w-fit text-gold group-hover:scale-110 transition-transform">
                             {opt.id === 'acting' ? <Drama size={20} /> : 
                              opt.id === 'voice' ? <Mic2 size={20} /> :
                              opt.id === 'movement' ? <Move size={20} /> :
                              opt.id === 'improv' ? <Brain size={20} /> :
                              opt.id === 'gym' ? <Dumbbell size={20} /> : <Users size={20} />}
                          </div>
                          <div className="text-sm font-bold text-white">{opt.name}</div>
                          <div className="text-[10px] text-gold font-mono">{formatMoney(opt.cost)}</div>
                        </button>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {view === 'management' && (
              <motion.div 
                key="management"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 h-full"
              >
                <div className="flex justify-between items-end border-b border-border-subtle pb-4">
                  <h2 className="logo-font text-4xl italic">Circle of Influence</h2>
                  <button onClick={findNewFriend} className="action-btn-styled bg-gold/10 border-gold/30 text-gold text-[10px]">HIRE PUBLICIST ($100)</button>
                </div>

                {relationships.filter(r => r.type === 'Rival').length > 0 && (
                  <div className="space-y-4">
                    <h3 className="stat-label flex items-center gap-2 text-red-500">
                      <TrendingDown size={14} /> The Competition (Rivals)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relationships.filter(r => r.type === 'Rival').map(rel => (
                        <div key={rel.id} className="bg-bg-elevated border border-red-900/40 p-6 rounded flex items-center gap-6 group hover:border-red-500/50 transition-all">
                          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-red-900 overflow-hidden relative">
                            <img 
                              src={`https://picsum.photos/seed/${rel.name}/128`} 
                              alt={rel.name} 
                              className="w-full h-full object-cover grayscale" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-red-900/10" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-lg text-red-100">{rel.name}</h4>
                              <span className="text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest bg-red-500/20 text-red-400">
                                RIVAL
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingDown className="text-red-500" size={10} />
                              <div className="text-[10px] text-red-900 uppercase">Enmity: {100 - rel.level}%</div>
                            </div>
                            <button 
                              onClick={() => {
                                addEvent("Counter-Sabotage", `You hired a fixer to leak a video of ${rel.name} forgetting their lines. Tension escalates.`, 'social', { money: -500, stress: 5, fame: 2 });
                                setRelationships(prev => prev.map(r => r.id === rel.id ? { ...r, level: Math.max(0, r.level - 5) } : r));
                              }}
                              className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                              Counter-Sabotage ($500)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="stat-label">Inner Circle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relationships.filter(r => r.type !== 'Rival').map(rel => (
                      <div key={rel.id} className="bg-bg-elevated border border-border-subtle p-6 rounded flex items-center gap-6 group hover:border-gold/20 transition-all">
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-border-subtle group-hover:border-gold/50 transition-colors overflow-hidden">
                          <img 
                            src={`https://picsum.photos/seed/${rel.name}/128`} 
                            alt={rel.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-lg">{rel.name}</h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest ${rel.type === 'Family' ? 'bg-blue-500/20 text-blue-400' : 'bg-gold/20 text-gold'}`}>
                              {rel.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Heart className="text-red-500" size={10} />
                            <div className="text-[10px] text-text-muted uppercase">Connection: {rel.level}%</div>
                          </div>
                          <button 
                            onClick={() => socialize(rel.id)}
                            className="text-[10px] font-black uppercase text-gold hover:underline"
                          >
                            Interact
                          </button>
                        </div>
                      </div>
                    ))}
                    {relationships.filter(r => r.type !== 'Rival').length === 0 && <p className="text-text-muted italic">No one in your inner circle yet.</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'industry' && (
              <motion.div 
                key="industry"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-12 h-full"
              >
                {/* Production Houses */}
                <section>
                   <h2 className="logo-font text-4xl italic mb-6 border-b border-border-subtle pb-4">Major Players</h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {PRODUCTION_HOUSES.map(ph => (
                        <div key={ph.id} className="bg-bg-elevated border border-border-subtle p-4 rounded flex flex-col items-center gap-3 group hover:border-gold/40 transition-all">
                           <div className="w-full aspect-video bg-black rounded p-2 overflow-hidden flex items-center justify-center">
                              <img 
                                src={`https://picsum.photos/seed/${ph.logo}/300/200?blur=1`} 
                                alt={ph.name} 
                                className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                referrerPolicy="no-referrer"
                              />
                           </div>
                           <div className="text-center">
                              <div className="text-xs font-black uppercase tracking-widest text-white">{ph.name}</div>
                              <div className="text-[9px] text-gold uppercase">{ph.type}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                {/* Actor Roster */}
                <section>
                   <div className="flex justify-between items-end mb-6 border-b border-border-subtle pb-4">
                     <h2 className="logo-font text-4xl italic">Talent Roster</h2>
                     <div className="text-[10px] text-text-muted uppercase font-bold">{npcs.length} ACTIVE ACTORS</div>
                   </div>
                   <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                      {npcs.slice(0, 50).map(npc => (
                        <div key={npc.id} className="bg-bg-elevated border border-border-subtle rounded overflow-hidden group hover:border-gold/30 transition-all">
                           <div className="aspect-square bg-black overflow-hidden relative">
                              <img 
                                src={`https://picsum.photos/seed/${npc.image}/200`} 
                                alt={npc.name} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                 <div className="text-[9px] font-black uppercase text-gold">{npc.careerStage}</div>
                              </div>
                           </div>
                           <div className="p-3 text-center">
                              <div className="text-[10px] font-bold text-white truncate">{npc.name}</div>
                              <div className="text-[8px] text-text-muted uppercase">Fame: {npc.fame}</div>
                           </div>
                        </div>
                      ))}
                      <div className="col-span-full py-10 text-center animate-pulse">
                         <p className="text-[10px] text-text-muted uppercase tracking-[0.5em]">And 150 more in the archives...</p>
                      </div>
                   </div>
                </section>

                {/* Available Roles */}
                <section>
                   <h2 className="logo-font text-4xl italic mb-6 border-b border-border-subtle pb-4">Casting Board</h2>
                   <div className="space-y-4">
                      {SAMPLE_PROJECTS.map(project => {
                        const house = PRODUCTION_HOUSES.find(ph => ph.id === project.productionHouseId);
                        const isStageMet = !project.requirements.stage || CAREER_STAGES.indexOf(stats.careerStage) >= CAREER_STAGES.indexOf(project.requirements.stage);
                        const isFameMet = !project.requirements.fame || stats.fame >= project.requirements.fame;
                        const canApply = isStageMet && isFameMet && !currentProject;
                        
                        return (
                          <div key={project.id} className="bg-bg-elevated border border-border-subtle p-6 rounded flex flex-col md:flex-row justify-between items-center gap-6 hover:border-gold/30 transition-all">
                             <div className="flex items-center gap-6 flex-1">
                                <div className="w-12 h-12 bg-black rounded border border-border-subtle flex items-center justify-center p-2">
                                   <img 
                                     src={`https://picsum.photos/seed/${house?.logo || 'film'}/64`} 
                                     alt="Studio" 
                                     className="w-full h-full object-contain opacity-50"
                                     referrerPolicy="no-referrer"
                                   />
                                </div>
                                <div>
                                   <div className="text-[10px] text-gold font-bold uppercase tracking-widest">{house?.name || 'Independent'} Presents</div>
                                   <h4 className="text-xl font-bold text-white mb-1">{project.title}</h4>
                                   <div className="flex gap-3 text-[10px] text-text-muted uppercase">
                                      <span className="flex items-center gap-1"><User size={10} /> {project.role}</span>
                                      <span className="flex items-center gap-1"><Clapperboard size={10} /> {project.genre}</span>
                                      <span className="flex items-center gap-1 text-gold"><DollarSign size={10} /> {formatMoney(project.pay)}</span>
                                   </div>
                                </div>
                             </div>

                             <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                <div className="flex gap-2">
                                   {project.requirements.skills && Object.entries(project.requirements.skills).map(([skill, val]) => (
                                      <div key={skill} className={`text-[8px] px-2 py-1 rounded border ${skills[skill as keyof PlayerSkills] >= (val as number) ? 'border-gold/30 text-gold bg-gold/5' : 'border-red-900/30 text-red-900 bg-red-900/5'}`}>
                                         {skill.toUpperCase()}: {val}
                                      </div>
                                   ))}
                                </div>
                                <button 
                                  onClick={() => startAudition(project)}
                                  disabled={!canApply}
                                  className={`action-btn-styled w-full md:w-auto px-8 ${canApply ? 'action-btn-primary' : 'opacity-20 cursor-not-allowed'}`}
                                >
                                  {currentProject ? 'ON SET' : !isStageMet ? 'LEVEL TOO LOW' : !isFameMet ? 'NOT FAMOUS ENOUGH' : 'APPLY FOR ROLE'}
                                </button>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </section>
              </motion.div>
            )}

            {view === 'agency' && (
              <motion.div 
                key="agency"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10 h-full"
              >
                <div className="flex justify-between items-end border-b border-border-subtle pb-4">
                  <h2 className="logo-font text-4xl italic">Talent Agency</h2>
                  <div className="text-[10px] text-text-muted uppercase font-bold">Secure your representation</div>
                </div>

                {agent ? (
                  <div className="bg-bg-elevated border border-gold/30 p-10 rounded-lg flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold bg-black">
                       <img 
                        src={`https://picsum.photos/seed/${agent.image}/200`} 
                        alt={agent.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                       <div className="flex justify-between items-center">
                          <h3 className="text-3xl font-bold">{agent.name}</h3>
                          <button onClick={fireAgent} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Terminate Contract</button>
                       </div>
                       <div className="grid grid-cols-2 gap-8 pt-4">
                          <div className="space-y-1">
                             <p className="text-[10px] text-text-muted uppercase">Negotiation Power</p>
                             <div className="flex items-center gap-3">
                                <TrendingUp className="text-gold" size={16} />
                                <span className="text-2xl font-black text-gold">{agent.negotiationSkill}%</span>
                             </div>
                             <p className="text-[9px] text-text-muted italic">Increases base project pay through aggressive negotiation.</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] text-text-muted uppercase">Commission Rate</p>
                             <div className="flex items-center gap-3">
                                <TrendingDown className="text-red-500" size={16} />
                                <span className="text-2xl font-black text-red-500">{agent.commissionRate * 100}%</span>
                             </div>
                             <p className="text-[9px] text-text-muted italic">Deducted from final negotiated project revenue.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {AVAILABLE_AGENTS.map(a => (
                      <div key={a.id} className="bg-bg-elevated border border-border-subtle p-8 rounded hover:border-gold/20 transition-all flex gap-6 group">
                        <div className="w-20 h-20 rounded bg-black overflow-hidden border border-border-subtle group-hover:border-gold/50 transition-colors">
                           <img 
                            src={`https://picsum.photos/seed/${a.image}/200`} 
                            alt={a.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                           <h4 className="text-xl font-bold">{a.name}</h4>
                           <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                              <span className="text-gold">Negotiation: {a.negotiationSkill}%</span>
                              <span className="text-red-500">Commission: {a.commissionRate * 100}%</span>
                           </div>
                           <button 
                             onClick={() => hireAgent(a)}
                             disabled={stats.money < a.costToHire}
                             className="action-btn-styled action-btn-primary w-full py-2 text-[10px]"
                           >
                             {a.costToHire === 0 ? 'HIRE (PRO BONO)' : `HIRE FOR ${formatMoney(a.costToHire)}`}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {view === 'awards' && (
              <motion.div 
                key="awards"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-12 h-full"
              >
                <div className="flex justify-between items-end border-b border-border-subtle pb-4">
                  <h2 className="logo-font text-4xl italic">Awards & Accolades</h2>
                  <div className="text-[10px] text-text-muted uppercase font-bold">Your Legacy in Gold</div>
                </div>

                {nominatedProject && (
                  <div className="bg-gold/5 border border-gold/20 p-8 rounded flex items-center justify-between mb-12">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-gold/10 rounded-full border border-gold/30">
                           <Trophy className="text-gold animate-bounce" size={32} />
                        </div>
                        <div>
                           <div className="text-xs font-black uppercase text-gold tracking-widest mb-1">Current Nomination</div>
                           <h3 className="text-2xl font-bold text-white mb-1">"{nominatedProject.category}"</h3>
                           <p className="text-sm text-text-muted">For your role in <span className="text-white italic">{nominatedProject.title}</span></p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Next Ceremony</p>
                        <p className="text-2xl font-black text-gold">Day {Math.ceil(stats.day / CEREMONY_FREQUENCY) * CEREMONY_FREQUENCY}</p>
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {awards.map(award => (
                    <div key={award.id} className="bg-bg-elevated border border-border-subtle p-8 rounded flex flex-col items-center text-center group hover:border-gold/50 transition-all hover:translate-y-[-4px]">
                       <div className="p-6 bg-black rounded-full border border-border-subtle mb-6 group-hover:scale-110 transition-transform relative">
                          <MedalIcon className="text-gold" size={48} />
                          <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/20 transition-all opacity-0 group-hover:opacity-100" />
                       </div>
                       <h4 className="text-lg font-bold text-white mb-2">{award.category}</h4>
                       <p className="text-[11px] text-text-muted uppercase mb-4">{award.title}</p>
                       <div className="w-full h-px bg-border-subtle mb-4" />
                       <p className="text-xs italic text-text-muted mb-1">"{award.projectTitle}"</p>
                       <p className="text-[9px] text-gold font-mono uppercase tracking-widest">Conferred Day {award.day}</p>
                    </div>
                  ))}
                  {awards.length === 0 && (
                    <div className="col-span-full py-20 bg-bg-elevated/50 border-2 border-dashed border-border-subtle rounded flex flex-col items-center justify-center gap-4">
                       <MedalIcon className="text-text-muted opacity-20" size={64} />
                       <p className="text-text-muted text-sm italic">The trophy cases stand empty. For now.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'ending' && selectedEnding && (
              <motion.div 
                key="ending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6"
              >
                <div className="max-w-4xl w-full bg-bg-deep border border-border-subtle p-12 rounded-lg relative overflow-hidden flex flex-col items-center text-center space-y-10">
                   {/* Background Glow */}
                   <div className={`absolute -top-40 -left-40 w-80 h-80 rounded-full blur-[100px] opacity-20 ${
                     selectedEnding.theme === 'gold' ? 'bg-gold' : 
                     selectedEnding.theme === 'red' ? 'bg-red-500' : 
                     selectedEnding.theme === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
                   }`} />

                   <div className="space-y-4 relative z-10">
                      <div className="text-[10px] text-gold font-black uppercase tracking-[0.6em] mb-2">Final Act Complete</div>
                      <h2 className={`logo-font text-6xl italic ${
                        selectedEnding.theme === 'gold' ? 'text-gold' : 
                        selectedEnding.theme === 'red' ? 'text-red-500' : 
                        selectedEnding.theme === 'blue' ? 'text-blue-400' : 'text-text-primary'
                      }`}>
                        {selectedEnding.title}
                      </h2>
                   </div>

                   <div className="max-w-2xl relative z-10">
                      <p className="text-xl text-text-primary leading-relaxed font-serif italic text-white/90">
                        {selectedEnding.description}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full pt-10 border-t border-border-subtle relative z-10">
                      <div>
                         <p className="text-[10px] text-text-muted uppercase mb-1">Total Fame</p>
                         <p className="text-3xl font-black text-white">{stats.fame}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-text-muted uppercase mb-1">Final Wealth</p>
                         <p className="text-3xl font-black text-white">{formatMoney(stats.money)}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-text-muted uppercase mb-1">Awards Won</p>
                         <p className="text-3xl font-black text-white">{awards.length}</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-text-muted uppercase mb-1">Days in Showbiz</p>
                         <p className="text-3xl font-black text-white">{stats.day}</p>
                      </div>
                   </div>

                   <div className="pt-10 relative z-10">
                      <button 
                        onClick={() => window.location.reload()}
                        className="action-btn-styled action-btn-primary px-12 py-4 text-sm tracking-widest"
                      >
                        RESTART JOURNEY
                      </button>
                   </div>

                   <MedalIcon className="absolute right-[-40px] top-[-40px] size-64 opacity-[0.05] rotate-45 pointer-events-none" />
                </div>
              </motion.div>
            )}

            {view === 'audition' && auditionScript && (
              <motion.div 
                key="audition"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="active-project-card p-12 space-y-8 flex flex-col justify-center max-w-3xl mx-auto"
              >
                {/* (Same Audition Content) */}
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Casting Office</div>
                  <h2 className="text-4xl logo-font italic text-white">The Script Reading</h2>
                </div>

                <div className="bg-black/50 p-8 rounded border border-border-subtle italic text-sm leading-relaxed space-y-6">
                  <div className="flex justify-between items-start not-italic border-b border-border-subtle pb-4 mb-4">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase mb-1">Project</div>
                      <div className="text-white font-bold">{auditionScript.title}</div>
                    </div>
                  </div>
                  
                  <div className="font-serif text-lg leading-relaxed text-text-primary">
                    {auditionScript.dialogue}
                  </div>
                  
                  <div className="pt-4 mt-6 border-t border-border-subtle text-gold text-xs italic">
                    Note: {auditionScript.directorsNote}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => {
                      // Success depends on a weighted average of skills
                      const avgSkill = (skills.acting * 3 + skills.voice + skills.movement + skills.improvisation) / 6;
                      handleAuditionResult(Math.random() < (avgSkill / 100 + 0.2));
                    }}
                    className="action-btn-styled action-btn-primary min-w-[180px]"
                  >
                    DELIVER PERFORMANCE
                  </button>
                  <button 
                    onClick={() => handleAuditionResult(false)}
                    className="action-btn-styled min-w-[180px]"
                  >
                    WITHDRAW
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sidebar Right */}
        <aside className="bg-bg-elevated border-l border-border-subtle p-6 overflow-y-auto">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold border-b border-border-subtle pb-3 mb-6 font-bold">Hollywood Buzz</h2>
          <div className="flex flex-col gap-6">
            {headlines.map((h, i) => (
              <div key={i} className="feed-item-style animate-in fade-in slide-in-from-right-2 duration-700">
                <p className="text-[10px] text-text-muted mb-2 font-mono flex items-center justify-between">
                  <span>Day {stats.day} • News</span>
                </p>
                <p className="text-text-primary leading-snug">
                  {h.split(' ').map((word, idx) => 
                     word.toLowerCase() === 'you' || word.toLowerCase() === 'star' ? <span key={idx} className="text-gold font-bold">{word} </span> : word + ' '
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border-subtle">
            <h4 className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-4">Event Log</h4>
            <div className="space-y-4">
               {events.slice(0, 5).map(ev => (
                 <div key={ev.id} className="text-[11px] border-b border-white/5 pb-2">
                   <div className="font-bold text-white/70">{ev.title}</div>
                   <div className="text-text-secondary text-[9px] uppercase">Day {ev.day}</div>
                 </div>
               ))}
            </div>
          </div>
        </aside>

        {/* Footer */}
        <footer className="col-span-full bg-[#080808] border-t border-border-subtle flex items-center justify-center gap-6 px-10">
          <button className="action-btn-styled" onClick={startAudition}>Request Audition</button>
          <button className="action-btn-styled" onClick={() => addEvent("Script Prep", "Immersed yourself in character studies.", "life", { skills: { acting: 2 }, happiness: -2, stress: 3 })}>Prep Performance</button>
          <button className="action-btn-styled" onClick={findNewFriend}>Networking Event</button>
          <button className="action-btn-styled" onClick={() => addEvent("Relaxation", "Took a day off to recover.", "life", { happiness: 10, stress: -20, money: -100 })}>Recover / Relax</button>
        </footer>
      </div>
    </div>
  );
}

function StatBar({ label, value, isStress }: { label: string, value: number, isStress?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] text-text-secondary uppercase">
        <span>{label}</span>
        <span className="font-bold">{Math.round(value)}%</span>
      </div>
      <div className="bar-bg">
        <motion.div 
          className="bar-fill"
          style={{ 
            width: `${value}%`, 
            backgroundColor: isStress ? (value > 70 ? '#C33' : value > 40 ? '#FF9800' : '#D4AF37') : undefined 
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function SkillDisplay({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gold">
        {React.cloneElement(icon as React.ReactElement, { size: 12 })}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[10px] text-text-secondary uppercase mb-1">
          <span>{label}</span>
          <span>{Math.round(value)}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
           <motion.div className="h-full bg-gold/50" initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} />
        </div>
      </div>
    </div>
  );
}

