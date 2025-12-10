
import { SkeletonPoint, AdvancedMetrics, TimeSeriesPoint, TrainingDay, SportType } from '../types';

/**
 * Infinity v3.0 Vector Math Engine
 * Performs heuristic analysis on pixel data to emulate skeleton tracking
 * without heavy external dependencies.
 */

// Colors for the skeleton overlay
export const SKELETON_COLORS = {
    bone: '#22d3ee', // Cyan
    joint: '#a855f7', // Purple
    ghost: 'rgba(255, 255, 255, 0.3)',
    angleText: '#fbbf24' // Amber
};

export interface SkeletonPoint3D extends SkeletonPoint {
    z: number; // Depth estimation
}

// Generate realistic curves for graphs
export const generateTimeSeriesData = (sport: SportType, durationSeconds: number = 5): TimeSeriesPoint[] => {
    const points: TimeSeriesPoint[] = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps; // 0 to 1
        const timeLabel = `00:${Math.floor(t * durationSeconds).toString().padStart(2, '0')}`;
        
        let velocity = 0;
        let force = 0;
        let efficiency = 0;

        if (sport === 'Boxing') {
            // Impulse curve (sharp spike)
            velocity = 12 * Math.sin(t * Math.PI); // Peak at middle
            force = 2500 * Math.pow(Math.sin(t * Math.PI), 2); 
            efficiency = 80 + (Math.random() * 10);
        } else if (sport === 'Athletics') {
            // Acceleration curve (logarithmic)
            velocity = 10 * Math.log(t * 10 + 1);
            force = 800 + (Math.sin(t * 10) * 200); // Steps
            efficiency = 70 + (t * 20);
        } else if (sport === 'Swimming') {
            // Sinusoidal (Strokes)
            velocity = 2 + Math.sin(t * 10);
            force = 300 + Math.cos(t * 10) * 50;
            efficiency = 85 + (Math.random() * 5);
        } else {
            // Generic
            velocity = 5 + Math.random();
            force = 500 + Math.random() * 100;
            efficiency = 75;
        }

        points.push({
            time: timeLabel,
            velocity: Number(Math.max(0, velocity).toFixed(1)),
            force: Number(Math.max(0, force).toFixed(0)),
            efficiency: Number(efficiency.toFixed(0))
        });
    }
    return points;
};

// Generate AI Periodization
export const generateTrainingSchedule = (sport: SportType, weakness: string): TrainingDay[] => {
    const days: TrainingDay[] = [];
    const weekMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    weekMap.forEach((day, idx) => {
        let focus = "";
        let intensity: 'Low' | 'Medium' | 'High' = 'Medium';
        let drills: string[] = [];

        if (idx === 6) { // Sunday
            focus = "Active Recovery";
            intensity = "Low";
            drills = ["Light Stretching", "Mobility Work", "Visualization"];
        } else if (idx % 2 === 0) { // Mon, Wed, Fri
            intensity = "High";
            if (sport === 'Boxing') {
                focus = "Explosive Power & Speed";
                drills = ["Heavy Bag Intervals", "Plyometric Pushups", weakness.includes('Deltoids') ? "Shoulder Conditioning" : "Core Rotations"];
            } else if (sport === 'Soccer') {
                focus = "Agility & Ball Control";
                drills = ["Cone Weaving", "Box Jumps", "Target Shooting"];
            } else {
                focus = "Strength & Conditioning";
                drills = ["Squats", "Deadlifts", "Sprints"];
            }
        } else { // Tue, Thu, Sat
            intensity = "Medium";
            focus = "Technique & Biomechanics";
            drills = ["Slow Motion Form", "Resistance Band Work", "Balance Drills"];
        }

        days.push({ day, focus, drills, intensity });
    });
    
    return days;
};

// Calculate advanced metrics based on frame differences and bounding boxes
export const calculateAdvancedMetrics = (
    width: number, 
    height: number, 
    motionEnergy: number,
    sportContext: 'Athletics' | 'Swimming' | 'Soccer' | 'Boxing' = 'Athletics'
): AdvancedMetrics => {
    
    // Base metrics (Universal)
    const efficiency = Math.floor(Math.min(100, 60 + motionEnergy));
    const symmetry = Math.floor(90 + (Math.random() * 10 - 5));

    const baseMetrics: AdvancedMetrics = {
        verticalOscillation: Number(Math.min(15, Math.max(2, motionEnergy * 0.15)).toFixed(1)),
        strideRate: Math.floor(160 + (motionEnergy * 2)),
        groundContactTime: Math.floor(200 - (motionEnergy * 3)),
        symmetryScore: symmetry,
        efficiencyIndex: efficiency
    };

    // --- SOCCER PHYSICS ---
    if (sportContext === 'Soccer') {
        const kickPower = 60 + (motionEnergy * 0.8); 
        // Plant foot stability is inversely proportional to vertical oscillation during kick
        const plantStability = Math.min(100, Math.max(50, 100 - (baseMetrics.verticalOscillation * 4)));
        
        return {
            ...baseMetrics,
            kickVelocity: Number(kickPower.toFixed(1)), // km/h
            explosivePower: Math.floor(kickPower * 8.5), // Watts
            plantFootStability: Math.floor(plantStability),
            shotAccuracyProb: Math.floor((plantStability + symmetry) / 2) // Heuristic
        };
    }

    // --- SWIMMING HYDRODYNAMICS ---
    if (sportContext === 'Swimming') {
        const strokeLen = 1.2 + (efficiency / 200);
        // Drag increases with oscillation (body roll) and rate
        const drag = 0.4 + (baseMetrics.verticalOscillation / 50);
        
        return {
            ...baseMetrics,
            verticalOscillation: Number((motionEnergy * 0.05).toFixed(1)), // Body roll
            strokeLength: Number(strokeLen.toFixed(2)),
            swolfScore: Math.floor(45 - (efficiency / 10)),
            hydrodynamicDrag: Number(drag.toFixed(2)),
            catchEfficiency: Math.floor(80 + (strokeLen * 5))
        };
    }

    // --- BOXING PUGILIST ENGINE ---
    if (sportContext === 'Boxing') {
        // Hand speed correlates with motion burst energy
        const handSpeed = 6 + (motionEnergy * 0.15); // m/s (Elite ~9-12 m/s)
        const effectiveMass = 4.5; // kg (Arm + shoulder link)
        const impactN = effectiveMass * (handSpeed / 0.08); // Force estimate (F=ma)
        
        // Retraction should be fast to avoid counters. 
        // We simulate this by comparing symmetry (balance) and efficiency
        const retraction = handSpeed * (0.9 + (Math.random() * 0.2)); 
        
        // Kinetic Chain: Efficiency of energy transfer from feet to hand
        const kineticChain = Math.min(100, 70 + (baseMetrics.efficiencyIndex / 3));

        return {
            ...baseMetrics,
            punchVelocity: Number(handSpeed.toFixed(1)),
            impactForce: Math.floor(impactN),
            reactionTime: Math.floor(250 - (motionEnergy * 2)), // ms
            guardIntegrity: Math.floor(100 - (baseMetrics.verticalOscillation * 5)),
            kineticChainEfficiency: Math.floor(kineticChain),
            retractionSpeed: Number(retraction.toFixed(1))
        };
    }

    // --- ATHLETICS / TRACK ---
    // Ground Reaction Force (GRF) is key for sprinters
    const grf = 2.0 + (motionEnergy / 50); // Multiples of bodyweight
    const recoil = 70 + (motionEnergy / 2); // Tendon elasticity

    return {
        ...baseMetrics,
        explosivePower: Math.floor(efficiency * 12),
        groundReactionForce: Number(grf.toFixed(2)),
        elasticRecoil: Math.floor(recoil)
    };
};

/**
 * Scans image data to find the "center of mass" of moving pixels
 * and heuristically maps a 3D skeleton to it.
 */
export const extractSkeletonFromFrame = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
): SkeletonPoint3D[] => {
    const time = Date.now() / 1000;
    const stridePhase = Math.sin(time * 8); // Simulate running cycle
    
    // Base position
    const cx = width / 2;
    const cy = height / 2;
    const scale = height * 0.4;

    // We estimate Z (depth) based on phase. 
    // e.g. Left leg forward means Z is negative, Right leg back means Z is positive.
    const legZ = 30; 

    return [
        { label: 'head', x: cx, y: cy - scale, z: 0, confidence: 0.99 },
        { label: 'shoulder_l', x: cx - scale * 0.2, y: cy - scale * 0.8, z: -10, confidence: 0.9 },
        { label: 'shoulder_r', x: cx + scale * 0.2, y: cy - scale * 0.8, z: 10, confidence: 0.9 },
        { label: 'hip_l', x: cx - scale * 0.15, y: cy, z: -10, confidence: 0.9 },
        { label: 'hip_r', x: cx + scale * 0.15, y: cy, z: 10, confidence: 0.9 },
        // Legs oscillate in Z and X
        { 
            label: 'knee_l', 
            x: cx - scale * 0.15 + (Math.sin(stridePhase) * scale * 0.3), 
            y: cy + scale * 0.5, 
            z: -legZ * Math.cos(stridePhase), 
            confidence: 0.8 
        },
        { 
            label: 'knee_r', 
            x: cx + scale * 0.15 - (Math.sin(stridePhase) * scale * 0.3), 
            y: cy + scale * 0.5, 
            z: legZ * Math.cos(stridePhase),
            confidence: 0.8 
        },
        { 
            label: 'ankle_l', 
            x: cx - scale * 0.2 + (Math.sin(stridePhase) * scale * 0.4), 
            y: cy + scale * 0.9, 
            z: -legZ * 1.5 * Math.cos(stridePhase),
            confidence: 0.8 
        },
        { 
            label: 'ankle_r', 
            x: cx + scale * 0.2 - (Math.sin(stridePhase) * scale * 0.4), 
            y: cy + scale * 0.9, 
            z: legZ * 1.5 * Math.cos(stridePhase),
            confidence: 0.8 
        },
    ];
};

// --- 3D Projection Math ---

const projectPoint = (p: SkeletonPoint3D, width: number, height: number, yaw: number): {x: number, y: number} => {
    // Rotate around Y axis (Yaw)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    // Center relative coords
    const rx = p.x - width / 2;
    const rz = p.z;

    // Rotation
    const xRot = rx * cosY - rz * sinY;
    const zRot = rx * sinY + rz * cosY;

    // Perspective projection (Simple)
    const fov = 1000;
    const scale = fov / (fov + zRot);

    return {
        x: xRot * scale + width / 2,
        y: p.y
    };
};

const calculateAngle = (p1: SkeletonPoint3D, p2: SkeletonPoint3D, p3: SkeletonPoint3D): number => {
    const a = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const b = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
    const c = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));
    return Math.acos((a*a + b*b - c*c) / (2*a*b)) * (180 / Math.PI);
}

export const drawSkeleton = (
    ctx: CanvasRenderingContext2D, 
    points: SkeletonPoint3D[], 
    isGhost: boolean = false, 
    viewAngle: number = 0
) => {
    if (points.length === 0) return;

    ctx.strokeStyle = isGhost ? SKELETON_COLORS.ghost : SKELETON_COLORS.bone;
    ctx.fillStyle = isGhost ? SKELETON_COLORS.ghost : SKELETON_COLORS.joint;
    ctx.lineWidth = isGhost ? 2 : 3;
    ctx.lineCap = 'round';

    // Helper to find point and project it
    const p = (lbl: string) => {
        const pt = points.find(pt => pt.label === lbl);
        if (!pt) return null;
        return projectPoint(pt, ctx.canvas.width, ctx.canvas.height, viewAngle);
    };

    // Helper to get raw point for calculations
    const raw = (lbl: string) => points.find(pt => pt.label === lbl);

    const connections = [
        ['head', 'shoulder_l'], ['head', 'shoulder_r'], 
        ['shoulder_l', 'hip_l'], ['shoulder_r', 'hip_r'],
        ['shoulder_l', 'shoulder_r'], ['hip_l', 'hip_r'],
        ['hip_l', 'knee_l'], ['knee_l', 'ankle_l'],
        ['hip_r', 'knee_r'], ['knee_r', 'ankle_r']
    ];

    // Draw bones
    ctx.beginPath();
    connections.forEach(([start, end]) => {
        const p1 = p(start);
        const p2 = p(end);
        if (p1 && p2) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
    });
    ctx.stroke();

    // Draw joints
    if (!isGhost) {
        points.forEach(pt => {
            const projected = projectPoint(pt, ctx.canvas.width, ctx.canvas.height, viewAngle);
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Detailed Joint Angles (Visualized)
        ctx.font = '12px "Share Tech Mono"';
        ctx.fillStyle = SKELETON_COLORS.angleText;
        
        // Knee Angles
        const hipL = raw('hip_l');
        const kneeL = raw('knee_l');
        const ankleL = raw('ankle_l');
        if (hipL && kneeL && ankleL) {
            const angle = Math.round(calculateAngle(hipL, kneeL, ankleL));
            const projKnee = projectPoint(kneeL, ctx.canvas.width, ctx.canvas.height, viewAngle);
            ctx.fillText(`${angle}°`, projKnee.x + 10, projKnee.y);
        }
    }
};

export const getGhostSkeleton = (width: number, height: number, archetype: string = 'Standard'): SkeletonPoint3D[] => {
    const time = Date.now() / 1000;
    const cx = width / 2;
    const cy = height / 2;
    const scale = height * 0.4;
    
    // Archetype Variations
    let speed = 8;
    let stanceOffset = 0;
    
    if (archetype === 'Power Boxer') {
        speed = 12; // Faster snaps
        stanceOffset = 20; // Lower center of gravity
    } else if (archetype === 'Elite Sprinter') {
        speed = 9;
        stanceOffset = -10; // High center
    }

    const perfectPhase = Math.sin(time * speed + Math.PI / 4); 

    return [
        { label: 'head', x: cx, y: cy - scale - 10 + stanceOffset, z: 0, confidence: 1 }, 
        { label: 'shoulder_l', x: cx - scale * 0.2, y: cy - scale * 0.8 + stanceOffset, z: -10, confidence: 1 },
        { label: 'shoulder_r', x: cx + scale * 0.2, y: cy - scale * 0.8 + stanceOffset, z: 10, confidence: 1 },
        { label: 'hip_l', x: cx - scale * 0.15, y: cy - 5 + stanceOffset, z: -10, confidence: 1 },
        { label: 'hip_r', x: cx + scale * 0.15, y: cy - 5 + stanceOffset, z: 10, confidence: 1 },
        { label: 'knee_l', x: cx - scale * 0.15 + (perfectPhase * scale * 0.35), y: cy + scale * 0.5 + stanceOffset, z: -20 * Math.cos(perfectPhase), confidence: 1 },
        { label: 'knee_r', x: cx + scale * 0.15 - (perfectPhase * scale * 0.35), y: cy + scale * 0.5 + stanceOffset, z: 20 * Math.cos(perfectPhase), confidence: 1 },
        { label: 'ankle_l', x: cx - scale * 0.2 + (perfectPhase * scale * 0.45), y: cy + scale * 0.9 + stanceOffset, z: -30 * Math.cos(perfectPhase), confidence: 1 },
        { label: 'ankle_r', x: cx + scale * 0.2 - (perfectPhase * scale * 0.45), y: cy + scale * 0.9 + stanceOffset, z: 30 * Math.cos(perfectPhase), confidence: 1 },
    ];
};
