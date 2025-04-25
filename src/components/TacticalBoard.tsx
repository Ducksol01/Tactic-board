import React, { useRef, useState, useEffect } from 'react';
import { 
  Circle,
  Square,
  Minus,
  ArrowRight,
  Eraser,
  Undo2,
  Download,
  Palette,
  Home,
  ExternalLink,
  Users
} from 'lucide-react';

type Tool = 'home' | 'away' | 'ball' | 'line' | 'arrow' | 'eraser';
type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1';
type Point = { x: number; y: number };
type DrawingElement = {
  type: Tool;
  x: number;
  y: number;
  name?: string;
  number?: string;
  color?: string;
  points?: Point[];
  controlPoint?: Point;
  endPoint?: Point;
};

const TacticalBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>('home');
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [homeColor, setHomeColor] = useState('#3b82f6');
  const [awayColor, setAwayColor] = useState('#ef4444');
  const [tempPosition, setTempPosition] = useState<Point | null>(null);
  const [draggingElement, setDraggingElement] = useState<number | null>(null);
  const [cursor, setCursor] = useState<string>('default');
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontStyle, setFontStyle] = useState<string>('normal');
  const [editingElementIndex, setEditingElementIndex] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [homeFormation, setHomeFormation] = useState<Formation>('4-4-2');
  const [awayFormation, setAwayFormation] = useState<Formation>('4-3-3');
  const doubleClickDelay = 300; // milliseconds

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth * 0.7;

    drawCanvas();
  }, [elements]);

  useEffect(() => {
    if (selectedTool === 'eraser') {
      setCursor('crosshair');
    } else if (selectedTool === 'line' || selectedTool === 'arrow') {
      setCursor('crosshair');
    } else {
      setCursor('default');
    }
  }, [selectedTool]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set field background
    ctx.fillStyle = '#2c8c3c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw soccer field
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Define margin first
    const margin = 30;

    // Add brand name
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('Kirdarbarcelona', canvas.width / 2, margin - 10);

    // Outer field
    ctx.strokeRect(margin, margin, canvas.width - 2 * margin, canvas.height - 2 * margin);

    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, margin);
    ctx.lineTo(canvas.width / 2, canvas.height - margin);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Penalty areas
    const penaltyWidth = 132;
    const penaltyHeight = 324;
    ctx.strokeRect(margin, (canvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    ctx.strokeRect(canvas.width - margin - penaltyWidth, (canvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);

    // Goal areas
    const goalWidth = 44;
    const goalHeight = 132;
    ctx.strokeRect(margin, (canvas.height - goalHeight) / 2, goalWidth, goalHeight);
    ctx.strokeRect(canvas.width - margin - goalWidth, (canvas.height - goalHeight) / 2, goalWidth, goalHeight);

    // Draw all elements
    elements.forEach((element, index) => {
      ctx.beginPath();
      switch (element.type) {
        case 'home':
        case 'away':
          // Draw circle
          ctx.fillStyle = element.color || (element.type === 'home' ? homeColor : awayColor);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.arc(element.x, element.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw number with blurry background
          if (element.number) {
            ctx.font = `${fontStyle} ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Measure text width for background
            const numberWidth = ctx.measureText(element.number).width;
            
            // Draw blurry background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.filter = 'blur(4px)';
            ctx.fillRect(element.x - numberWidth/2 - 8, element.y - fontSize/2 - 4, numberWidth + 16, fontSize + 8);
            ctx.filter = 'none';
            
            // Draw text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(element.number, element.x, element.y);
          }

          // Draw name with blurry background
          if (element.name) {
            ctx.font = `${fontStyle} ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Measure text width for background
            const nameWidth = ctx.measureText(element.name).width;
            
            // Draw blurry background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.filter = 'blur(4px)';
            ctx.fillRect(element.x - nameWidth/2 - 8, element.y + 20 - 4, nameWidth + 16, fontSize + 8);
            ctx.filter = 'none';
            
            // Draw text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(element.name, element.x, element.y + 20);
          }

          // Draw highlight if hovering
          if (draggingElement === index) {
            ctx.beginPath();
            ctx.arc(element.x, element.y, 18, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          break;
        case 'ball':
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.arc(element.x, element.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        case 'line':
        case 'arrow':
          if (element.endPoint) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            
            // Draw curved line
            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            
            if (element.controlPoint) {
              ctx.quadraticCurveTo(
                element.controlPoint.x,
                element.controlPoint.y,
                element.endPoint.x,
                element.endPoint.y
              );
            } else {
              ctx.lineTo(element.endPoint.x, element.endPoint.y);
            }
            
            ctx.stroke();

            // Draw arrow head if it's an arrow
            if (element.type === 'arrow') {
              const angle = Math.atan2(
                element.endPoint.y - (element.controlPoint?.y || element.y),
                element.endPoint.x - (element.controlPoint?.x || element.x)
              );
              
              ctx.beginPath();
              ctx.moveTo(element.endPoint.x, element.endPoint.y);
              ctx.lineTo(
                element.endPoint.x - 15 * Math.cos(angle - Math.PI / 6),
                element.endPoint.y - 15 * Math.sin(angle - Math.PI / 6)
              );
              ctx.moveTo(element.endPoint.x, element.endPoint.y);
              ctx.lineTo(
                element.endPoint.x - 15 * Math.cos(angle + Math.PI / 6),
                element.endPoint.y - 15 * Math.sin(angle + Math.PI / 6)
              );
              ctx.stroke();
            }
          }
          break;
      }
    });

    // Draw current element while drawing
    if (currentElement && (currentElement.type === 'line' || currentElement.type === 'arrow')) {
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      
      if (currentElement.endPoint) {
        ctx.beginPath();
        ctx.moveTo(currentElement.x, currentElement.y);
        
        if (currentElement.controlPoint) {
          ctx.quadraticCurveTo(
            currentElement.controlPoint.x,
            currentElement.controlPoint.y,
            currentElement.endPoint.x,
            currentElement.endPoint.y
          );
        } else {
          ctx.lineTo(currentElement.endPoint.x, currentElement.endPoint.y);
        }
        
        ctx.stroke();

        if (currentElement.type === 'arrow') {
          const angle = Math.atan2(
            currentElement.endPoint.y - (currentElement.controlPoint?.y || currentElement.y),
            currentElement.endPoint.x - (currentElement.controlPoint?.x || currentElement.x)
          );
          
          ctx.beginPath();
          ctx.moveTo(currentElement.endPoint.x, currentElement.endPoint.y);
          ctx.lineTo(
            currentElement.endPoint.x - 15 * Math.cos(angle - Math.PI / 6),
            currentElement.endPoint.y - 15 * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(currentElement.endPoint.x, currentElement.endPoint.y);
          ctx.lineTo(
            currentElement.endPoint.x - 15 * Math.cos(angle + Math.PI / 6),
            currentElement.endPoint.y - 15 * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const currentTime = new Date().getTime();
    const isDoubleClick = currentTime - lastClickTime < doubleClickDelay;
    setLastClickTime(currentTime);

    if (selectedTool === 'line' || selectedTool === 'arrow') {
      setIsDrawing(true);
      const newElement: DrawingElement = {
        type: selectedTool,
        x,
        y,
        endPoint: { x, y }
      };
      setCurrentElement(newElement);
      return;
    }

    // Check if clicking on an existing element
    const clickedElementIndex = elements.findIndex((element) => {
      const distance = Math.sqrt(
        Math.pow(element.x - x, 2) + Math.pow(element.y - y, 2)
      );
      return distance < 15;
    });

    if (clickedElementIndex !== -1) {
      // If eraser tool is selected, remove the element
      if (selectedTool === 'eraser') {
        const newElements = [...elements];
        newElements.splice(clickedElementIndex, 1);
        setElements(newElements);
        return;
      }
      
      // If double-clicking on a home or away player, open dialog to edit
      if (isDoubleClick && 
          (elements[clickedElementIndex].type === 'home' || 
           elements[clickedElementIndex].type === 'away')) {
        setEditingElementIndex(clickedElementIndex);
        setPlayerName(elements[clickedElementIndex].name || '');
        setPlayerNumber(elements[clickedElementIndex].number || '');
        setSelectedTool(elements[clickedElementIndex].type);
        setShowDialog(true);
        return;
      }
      
      // Single click on element - drag it
      setDraggingElement(clickedElementIndex);
      return;
    }

    if (selectedTool === 'home' || selectedTool === 'away') {
      // For single click, immediately add a home/away player without dialog
      const newElement: DrawingElement = {
        type: selectedTool,
        x,
        y,
        color: selectedTool === 'home' ? homeColor : awayColor
      };
      setElements([...elements, newElement]);
    } else {
      setIsDrawing(true);
      const newElement: DrawingElement = { type: selectedTool, x, y };
      setCurrentElement(newElement);
      setElements([...elements, newElement]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && draggingElement === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingElement !== null) {
      const newElements = [...elements];
      newElements[draggingElement] = {
        ...newElements[draggingElement],
        x,
        y,
      };
      setElements(newElements);
    } else if (currentElement && (currentElement.type === 'line' || currentElement.type === 'arrow')) {
      // Update control point for curve
      const startX = currentElement.x;
      const startY = currentElement.y;
      const controlX = (startX + x) / 2;
      const controlY = y - Math.abs(x - startX) / 4;

      setCurrentElement({
        ...currentElement,
        controlPoint: { x: controlX, y: controlY },
        endPoint: { x, y }
      });
    }
  };

  const handleMouseUp = () => {
    if (currentElement && (currentElement.type === 'line' || currentElement.type === 'arrow')) {
      setElements([...elements, currentElement]);
    }
    setDraggingElement(null);
    setIsDrawing(false);
    setCurrentElement(null);
  };

  const handleUndo = () => {
    setElements(elements.slice(0, -1));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'tactical-board.png';
    link.href = dataUrl;
    link.click();
  };

  // Formation presets with relative positions (0-1 range to be scaled to canvas size)
  const formationPresets: Record<Formation, { home: Point[], away: Point[] }> = {
    '4-4-2': {
      home: [
        { x: 0.1, y: 0.5 }, // GK
        { x: 0.2, y: 0.2 }, // DEF
        { x: 0.2, y: 0.4 }, // DEF
        { x: 0.2, y: 0.6 }, // DEF
        { x: 0.2, y: 0.8 }, // DEF
        { x: 0.4, y: 0.2 }, // MID
        { x: 0.4, y: 0.4 }, // MID
        { x: 0.4, y: 0.6 }, // MID
        { x: 0.4, y: 0.8 }, // MID
        { x: 0.6, y: 0.35 }, // FWD
        { x: 0.6, y: 0.65 }  // FWD
      ],
      away: [
        { x: 0.9, y: 0.5 }, // GK
        { x: 0.8, y: 0.2 }, // DEF
        { x: 0.8, y: 0.4 }, // DEF
        { x: 0.8, y: 0.6 }, // DEF
        { x: 0.8, y: 0.8 }, // DEF
        { x: 0.6, y: 0.2 }, // MID
        { x: 0.6, y: 0.4 }, // MID
        { x: 0.6, y: 0.6 }, // MID
        { x: 0.6, y: 0.8 }, // MID
        { x: 0.4, y: 0.35 }, // FWD
        { x: 0.4, y: 0.65 }  // FWD
      ]
    },
    '4-3-3': {
      home: [
        { x: 0.1, y: 0.5 }, // GK
        { x: 0.2, y: 0.2 }, // DEF
        { x: 0.2, y: 0.4 }, // DEF
        { x: 0.2, y: 0.6 }, // DEF
        { x: 0.2, y: 0.8 }, // DEF
        { x: 0.4, y: 0.3 }, // MID
        { x: 0.4, y: 0.5 }, // MID
        { x: 0.4, y: 0.7 }, // MID
        { x: 0.6, y: 0.25 }, // FWD
        { x: 0.6, y: 0.5 }, // FWD
        { x: 0.6, y: 0.75 }  // FWD
      ],
      away: [
        { x: 0.9, y: 0.5 }, // GK
        { x: 0.8, y: 0.2 }, // DEF
        { x: 0.8, y: 0.4 }, // DEF
        { x: 0.8, y: 0.6 }, // DEF
        { x: 0.8, y: 0.8 }, // DEF
        { x: 0.6, y: 0.3 }, // MID
        { x: 0.6, y: 0.5 }, // MID
        { x: 0.6, y: 0.7 }, // MID
        { x: 0.4, y: 0.25 }, // FWD
        { x: 0.4, y: 0.5 }, // FWD
        { x: 0.4, y: 0.75 }  // FWD
      ]
    },
    '3-5-2': {
      home: [
        { x: 0.1, y: 0.5 }, // GK
        { x: 0.2, y: 0.3 }, // DEF
        { x: 0.2, y: 0.5 }, // DEF
        { x: 0.2, y: 0.7 }, // DEF
        { x: 0.35, y: 0.2 }, // MID
        { x: 0.4, y: 0.35 }, // MID
        { x: 0.4, y: 0.5 }, // MID
        { x: 0.4, y: 0.65 }, // MID
        { x: 0.35, y: 0.8 }, // MID
        { x: 0.6, y: 0.35 }, // FWD
        { x: 0.6, y: 0.65 }  // FWD
      ],
      away: [
        { x: 0.9, y: 0.5 }, // GK
        { x: 0.8, y: 0.3 }, // DEF
        { x: 0.8, y: 0.5 }, // DEF
        { x: 0.8, y: 0.7 }, // DEF
        { x: 0.65, y: 0.2 }, // MID
        { x: 0.6, y: 0.35 }, // MID
        { x: 0.6, y: 0.5 }, // MID
        { x: 0.6, y: 0.65 }, // MID
        { x: 0.65, y: 0.8 }, // MID
        { x: 0.4, y: 0.35 }, // FWD
        { x: 0.4, y: 0.65 }  // FWD
      ]
    },
    '5-3-2': {
      home: [
        { x: 0.1, y: 0.5 }, // GK
        { x: 0.2, y: 0.1 }, // DEF
        { x: 0.2, y: 0.3 }, // DEF
        { x: 0.2, y: 0.5 }, // DEF
        { x: 0.2, y: 0.7 }, // DEF
        { x: 0.2, y: 0.9 }, // DEF
        { x: 0.4, y: 0.3 }, // MID
        { x: 0.4, y: 0.5 }, // MID
        { x: 0.4, y: 0.7 }, // MID
        { x: 0.6, y: 0.35 }, // FWD
        { x: 0.6, y: 0.65 }  // FWD
      ],
      away: [
        { x: 0.9, y: 0.5 }, // GK
        { x: 0.8, y: 0.1 }, // DEF
        { x: 0.8, y: 0.3 }, // DEF
        { x: 0.8, y: 0.5 }, // DEF
        { x: 0.8, y: 0.7 }, // DEF
        { x: 0.8, y: 0.9 }, // DEF
        { x: 0.6, y: 0.3 }, // MID
        { x: 0.6, y: 0.5 }, // MID
        { x: 0.6, y: 0.7 }, // MID
        { x: 0.4, y: 0.35 }, // FWD
        { x: 0.4, y: 0.65 }  // FWD
      ]
    },
    '4-2-3-1': {
      home: [
        { x: 0.1, y: 0.5 }, // GK
        { x: 0.2, y: 0.2 }, // DEF
        { x: 0.2, y: 0.4 }, // DEF
        { x: 0.2, y: 0.6 }, // DEF
        { x: 0.2, y: 0.8 }, // DEF
        { x: 0.35, y: 0.35 }, // DMF
        { x: 0.35, y: 0.65 }, // DMF
        { x: 0.5, y: 0.25 }, // AMF
        { x: 0.5, y: 0.5 }, // AMF
        { x: 0.5, y: 0.75 }, // AMF
        { x: 0.65, y: 0.5 }  // FWD
      ],
      away: [
        { x: 0.9, y: 0.5 }, // GK
        { x: 0.8, y: 0.2 }, // DEF
        { x: 0.8, y: 0.4 }, // DEF
        { x: 0.8, y: 0.6 }, // DEF
        { x: 0.8, y: 0.8 }, // DEF
        { x: 0.65, y: 0.35 }, // DMF
        { x: 0.65, y: 0.65 }, // DMF
        { x: 0.5, y: 0.25 }, // AMF
        { x: 0.5, y: 0.5 }, // AMF
        { x: 0.5, y: 0.75 }, // AMF
        { x: 0.35, y: 0.5 }  // FWD
      ]
    }
  };

  // Function to apply formation
  const applyFormation = (team: 'home' | 'away', formation: Formation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const margin = 30; // Same margin as in drawCanvas
    
    // Calculate playable area
    const playableWidth = width - 2 * margin;
    const playableHeight = height - 2 * margin;
    
    // Filter out existing players of the selected team
    const filteredElements = elements.filter(el => el.type !== team);
    
    // Create new players based on formation
    const newPlayers = formationPresets[formation][team].map((pos, index) => {
      // Convert relative positions to canvas coordinates
      const x = margin + playableWidth * pos.x;
      const y = margin + playableHeight * pos.y;
      
      return {
        type: team as Tool,
        x,
        y,
        number: `${index + 1}`,
        color: team === 'home' ? homeColor : awayColor
      };
    });
    
    // Update elements with new formation
    setElements([...filteredElements, ...newPlayers]);
  };

  const handleAddPlayer = () => {
    if (editingElementIndex !== null) {
      // Edit existing player
      const newElements = [...elements];
      newElements[editingElementIndex] = {
        ...newElements[editingElementIndex],
        name: playerName,
        number: playerNumber,
        color: selectedTool === 'home' ? homeColor : awayColor
      };
      setElements(newElements);
      setEditingElementIndex(null);
    } else if (tempPosition) {
      // Add new player (this case is for backward compatibility)
      const newElement: DrawingElement = {
        type: selectedTool,
        x: tempPosition.x,
        y: tempPosition.y,
        name: playerName,
        number: playerNumber,
        color: selectedTool === 'home' ? homeColor : awayColor
      };
      setElements([...elements, newElement]);
      setTempPosition(null);
    }
    setShowDialog(false);
    setPlayerName('');
    setPlayerNumber('');
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex space-x-4">
          <button
            className={`p-3 rounded-lg ${
              selectedTool === 'home' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTool('home')}
            title="Add Home Player"
          >
            <span className="font-medium">Home</span>
          </button>
          <button
            className={`p-3 rounded-lg ${
              selectedTool === 'away' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTool('away')}
            title="Add Away Player"
          >
            <span className="font-medium">Away</span>
          </button>
          <button
            className={`p-3 rounded-lg ${
              selectedTool === 'ball' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTool('ball')}
            title="Add Ball"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            className={`p-3 rounded-lg ${
              selectedTool === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTool('line')}
            title="Draw Line"
          >
            <Minus className="w-6 h-6" />
          </button>
          <button
            className={`p-3 rounded-lg ${
              selectedTool === 'arrow' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTool('arrow')}
            title="Draw Arrow"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <button
            className={`p-3 rounded-lg ${
              selectedTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTool('eraser')}
            title="Eraser"
          >
            <Eraser className="w-6 h-6" />
          </button>
          <button
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200"
            onClick={handleUndo}
            title="Undo"
          >
            <Undo2 className="w-6 h-6" />
          </button>
          <button
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200"
            onClick={handleSave}
            title="Save"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
        
        {/* Formation controls */}
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Home Formation:</label>
            <select
              value={homeFormation}
              onChange={(e) => {
                const formation = e.target.value as Formation;
                setHomeFormation(formation);
              }}
              className="border rounded-md px-2 py-1"
            >
              <option value="4-4-2">4-4-2</option>
              <option value="4-3-3">4-3-3</option>
              <option value="3-5-2">3-5-2</option>
              <option value="5-3-2">5-3-2</option>
              <option value="4-2-3-1">4-2-3-1</option>
            </select>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
              onClick={() => applyFormation('home', homeFormation)}
            >
              Apply
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-red-500" />
            <label className="text-sm font-medium text-gray-700">Away Formation:</label>
            <select
              value={awayFormation}
              onChange={(e) => {
                const formation = e.target.value as Formation;
                setAwayFormation(formation);
              }}
              className="border rounded-md px-2 py-1"
            >
              <option value="4-4-2">4-4-2</option>
              <option value="4-3-3">4-3-3</option>
              <option value="3-5-2">3-5-2</option>
              <option value="5-3-2">5-3-2</option>
              <option value="4-2-3-1">4-2-3-1</option>
            </select>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
              onClick={() => applyFormation('away', awayFormation)}
            >
              Apply
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Text Size:</label>
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600">{fontSize}px</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Text Style:</label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="border rounded-md px-2 py-1"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
              <option value="bold italic">Bold Italic</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Home Color:</label>
            <input
              type="color"
              value={homeColor}
              onChange={(e) => setHomeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Away Color:</label>
            <input
              type="color"
              value={awayColor}
              onChange={(e) => setAwayColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg w-full touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor }}
      />

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingElementIndex !== null ? 'Edit' : 'Add'} {selectedTool === 'home' ? 'Home Player' : 'Away Player'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number
                </label>
                <input
                  type="text"
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter number"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    setShowDialog(false);
                    setPlayerName('');
                    setPlayerNumber('');
                    setTempPosition(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleAddPlayer}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalBoard;