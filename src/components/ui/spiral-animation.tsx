'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

// 向量工具类
class Vector2D {
    constructor(public x: number, public y: number) {}
    
    static random(min: number, max: number): number {
        return min + Math.random() * (max - min)
    }
}

class Vector3D {
    constructor(public x: number, public y: number, public z: number) {}
    
    static random(min: number, max: number): number {
        return min + Math.random() * (max - min)
    }
}

// 动画控制器
class AnimationController {
    private timeline: gsap.core.Timeline
    private time = 0
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private dpr: number
    private size: number
    private stars: Star[] = []
    
    // 常量
    private readonly changeEventTime = 0.32
    private readonly cameraZ = -400
    private readonly cameraTravelDistance = 3400
    private readonly startDotYOffset = 28
    private readonly viewZoom = 100
    private readonly numberOfStars = 5000
    private readonly trailLength = 80
    
    private onComplete?: () => void
    
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dpr: number, size: number, onComplete?: () => void) {
        this.canvas = canvas
        this.ctx = ctx
        this.dpr = dpr
        this.size = size
        this.onComplete = onComplete
        this.timeline = gsap.timeline({ 
            repeat: 0,
            onComplete: () => {
                if (this.onComplete) this.onComplete()
            }
        })
        
        // 初始化
        this.setupRandomGenerator()
        this.createStars()
        this.setupTimeline()
    }
    
    // 设置随机数生成器
    private setupRandomGenerator() {
        const originalRandom = Math.random
        const customRandom = () => {
            let seed = 1234
            return () => {
                seed = (seed * 9301 + 49297) % 233280
                return seed / 233280
            }
        }
        
        Math.random = customRandom()
        this.createStars()
        Math.random = originalRandom
    }
    
    // 创建星星
    private createStars() {
        for (let i = 0; i < this.numberOfStars; i++) {
            this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance))
        }
    }
    
    // 设置动画时间线
    private setupTimeline() {
        this.timeline
            .to(this, {
                time: 1,
                duration: 8,
                repeat: 0,
                ease: "none",
                onUpdate: () => this.render()
            })
    }
    
    // 缓动函数
    public ease(p: number, g: number): number {
        if (p < 0.5) 
            return 0.5 * Math.pow(2 * p, g)
        else
            return 1 - 0.5 * Math.pow(2 * (1 - p), g)
    }
    
    // 弹性缓动
    public easeOutElastic(x: number): number {
        const c4 = (2 * Math.PI) / 4.5
        if (x <= 0) return 0
        if (x >= 1) return 1
        return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1
    }
    
    // 映射函数
    public map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
    }
    
    // 限制范围
    public constrain(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max)
    }
    
    // 线性插值
    public lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t
    }
    
    // 螺旋路径
    public spiralPath(p: number): Vector2D {
        p = this.constrain(1.2 * p, 0, 1)
        p = this.ease(p, 1.8)
        const numberOfSpiralTurns = 6
        const theta = 2 * Math.PI * numberOfSpiralTurns * Math.sqrt(p)
        const r = 170 * Math.sqrt(p)
        
        return new Vector2D(
            r * Math.cos(theta),
            r * Math.sin(theta) + this.startDotYOffset
        )
    }
    
    // 旋转变换
    public rotate(v1: Vector2D, v2: Vector2D, p: number, orientation: boolean): Vector2D {
        const middle = new Vector2D(
            (v1.x + v2.x) / 2,
            (v1.y + v2.y) / 2
        )
        
        const dx = v1.x - middle.x
        const dy = v1.y - middle.y
        const angle = Math.atan2(dy, dx)
        const o = orientation ? -1 : 1
        const r = Math.sqrt(dx * dx + dy * dy)
        
        // 弹性效果
        const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p)
        
        return new Vector2D(
            middle.x + r * (1 + bounce) * Math.cos(angle + o * Math.PI * this.easeOutElastic(p)),
            middle.y + r * (1 + bounce) * Math.sin(angle + o * Math.PI * this.easeOutElastic(p))
        )
    }
    
    // 投影点
    public showProjectedDot(position: Vector3D, sizeFactor: number) {
        const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1)
        const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance
        
        if (position.z > newCameraZ) {
            const dotDepthFromCamera = position.z - newCameraZ
            
            // 3D -> 2D投影公式
            const x = this.viewZoom * position.x / dotDepthFromCamera
            const y = this.viewZoom * position.y / dotDepthFromCamera
            const sw = 400 * sizeFactor / dotDepthFromCamera
            
            this.ctx.lineWidth = sw
            this.ctx.beginPath()
            this.ctx.arc(x, y, 0.5, 0, Math.PI * 2)
            this.ctx.fill()
        }
    }
    
    // 绘制起始点
    private drawStartDot() {
        if (this.time > this.changeEventTime) {
            const dy = this.cameraZ * this.startDotYOffset / this.viewZoom
            const position = new Vector3D(0, dy, this.cameraTravelDistance)
            this.showProjectedDot(position, 2.5)
        }
    }
    
    // 主渲染函数
    public render() {
        const ctx = this.ctx
        if (!ctx) return
        
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, this.size, this.size)
        
        ctx.save()
        ctx.translate(this.size / 2, this.size / 2)
        
        // 计算时间参数
        const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1)
        const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1)
        
        // 旋转相机
        ctx.rotate(-Math.PI * this.ease(t2, 2.7))
        
        // 绘制轨迹
        this.drawTrail(t1)
        
        // 绘制星星
        ctx.fillStyle = 'white'
        for (const star of this.stars) {
            star.render(t1, this)
        }
        
        // 绘制起始点
        this.drawStartDot()
        
        ctx.restore()
    }
    
    // 绘制轨迹
    private drawTrail(t1: number) {
        for (let i = 0; i < this.trailLength; i++) {
            const f = this.map(i, 0, this.trailLength, 1.1, 0.1)
            const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f
            
            this.ctx.fillStyle = 'white'
            this.ctx.lineWidth = sw
            
            const pathTime = t1 - 0.00015 * i
            const position = this.spiralPath(pathTime)
            
            // 添加旋转效果
            const basePos = position
            const offset = new Vector2D(position.x + 5, position.y + 5)
            const rotated = this.rotate(
                basePos, 
                offset, 
                Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5, 
                i % 2 === 0
            )
            
            this.ctx.beginPath()
            this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2)
            this.ctx.fill()
        }
    }
    
    // 暂停动画
    public pause() {
        this.timeline.pause()
    }
    
    // 恢复动画
    public resume() {
        this.timeline.play()
    }
    
    // 销毁动画
    public destroy() {
        this.timeline.kill()
    }
}

// 星星类
class Star {
    private dx: number
    private dy: number
    private spiralLocation: number
    private strokeWeightFactor: number
    private z: number
    private angle: number
    private distance: number
    private rotationDirection: number // 旋转方向
    private expansionRate: number // 扩散速率
    private finalScale: number // 最终尺寸比例
    
    constructor(cameraZ: number, cameraTravelDistance: number) {
        this.angle = Math.random() * Math.PI * 2
        this.distance = 30 * Math.random() + 15
        this.rotationDirection = Math.random() > 0.5 ? 1 : -1
        this.expansionRate = 1.2 + Math.random() * 0.8 // 增加扩散率从0.8-1.2到1.2-2.0
        this.finalScale = 0.7 + Math.random() * 0.6 // 0.7-1.3之间的最终尺寸
        
        this.dx = this.distance * Math.cos(this.angle)
        this.dy = this.distance * Math.sin(this.angle)
        
        this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3
        this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ)
        
        const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t
        this.z = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation)
        this.strokeWeightFactor = Math.pow(Math.random(), 2.0)
    }
    
    render(p: number, controller: AnimationController) {
        const spiralPos = controller.spiralPath(this.spiralLocation)
        const q = p - this.spiralLocation
        
        if (q > 0) {
            const displacementProgress = controller.constrain(4 * q, 0, 1)
            
            // 使用混合缓动函数，柔和开始，有弹性结束
            const linearEasing = displacementProgress;
            const elasticEasing = controller.easeOutElastic(displacementProgress);
            const powerEasing = Math.pow(displacementProgress, 2);
            
            // 混合不同缓动效果，创造更自然的动画
            let easing;
            if (displacementProgress < 0.3) {
                // 开始阶段：主要是线性和二次方
                easing = controller.lerp(linearEasing, powerEasing, displacementProgress / 0.3);
            } else if (displacementProgress < 0.7) {
                // 中间阶段：过渡到弹性
                const t = (displacementProgress - 0.3) / 0.4;
                easing = controller.lerp(powerEasing, elasticEasing, t);
            } else {
                // 最终阶段：弹性效果
                easing = elasticEasing;
            }
            
            // 计算位置偏移
            let screenX, screenY;
            
            // 分阶段应用不同的运动模式
            if (displacementProgress < 0.3) {
                // 初始阶段：直线移动 (30%)
                screenX = controller.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
                screenY = controller.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
            } else if (displacementProgress < 0.7) {
                // 中间阶段：曲线移动 (40%)
                const midProgress = (displacementProgress - 0.3) / 0.4;
                const curveStrength = Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5;
                
                // 基础位置（30%直线距离）
                const baseX = spiralPos.x + this.dx * 0.3;
                const baseY = spiralPos.y + this.dy * 0.3;
                
                // 目标位置（70%距离）
                const targetX = spiralPos.x + this.dx * 0.7;
                const targetY = spiralPos.y + this.dy * 0.7;
                
                // 添加曲线偏移
                const perpX = -this.dy * 0.4 * curveStrength;
                const perpY = this.dx * 0.4 * curveStrength;
                
                screenX = controller.lerp(baseX, targetX, midProgress) + perpX * midProgress;
                screenY = controller.lerp(baseY, targetY, midProgress) + perpY * midProgress;
            } else {
                // 最终阶段：更强的螺旋扩散 (30%)
                const finalProgress = (displacementProgress - 0.7) / 0.3;
                
                // 基础位置（70%直线距离）
                const baseX = spiralPos.x + this.dx * 0.7;
                const baseY = spiralPos.y + this.dy * 0.7;
                
                // 最终位置（更远距离）
                const targetDistance = this.distance * this.expansionRate * 1.5;
                const spiralTurns = 1.2 * this.rotationDirection;
                const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI;
                
                const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle);
                const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle);
                
                // 应用缓动
                screenX = controller.lerp(baseX, targetX, finalProgress);
                screenY = controller.lerp(baseY, targetY, finalProgress);
            }
            
            // 将2D屏幕坐标转换为3D空间坐标
            const vx = (this.z - controller['cameraZ']) * screenX / controller['viewZoom'];
            const vy = (this.z - controller['cameraZ']) * screenY / controller['viewZoom'];
            
            const position = new Vector3D(vx, vy, this.z);
            
            // 粒子大小动画：初始正常，中间稍微变大，最终根据finalScale调整
            let sizeMultiplier = 1.0;
            if (displacementProgress < 0.6) {
                // 前60%：略微膨胀
                sizeMultiplier = 1.0 + displacementProgress * 0.2;
            } else {
                // 后40%：过渡到最终尺寸
                const t = (displacementProgress - 0.6) / 0.4;
                sizeMultiplier = 1.2 * (1.0 - t) + this.finalScale * t;
            }
            
            const dotSize = 8.5 * this.strokeWeightFactor * sizeMultiplier;
            
            controller.showProjectedDot(position, dotSize);
        }
    }
}

export function SpiralAnimation({ onComplete }: { onComplete?: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<AnimationController | null>(null)
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })
    
    // 处理窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }
        
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    
    // 创建和管理动画
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // 处理DPR以解决模糊问题
        const dpr = window.devicePixelRatio || 1
        // 使用全屏尺寸
        const size = Math.max(dimensions.width, dimensions.height)
        
        canvas.width = size * dpr
        canvas.height = size * dpr
        
        // 设置CSS尺寸
        canvas.style.width = `${dimensions.width}px`
        canvas.style.height = `${dimensions.height}px`
        
        // 缩放上下文以适应DPR
        ctx.scale(dpr, dpr)
        
        // 创建动画控制器
        animationRef.current = new AnimationController(canvas, ctx, dpr, size, onComplete)
        
        return () => {
            // 清理动画
            if (animationRef.current) {
                animationRef.current.destroy()
                animationRef.current = null
            }
        }
    }, [dimensions])
    
    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
        </div>
    )
}
