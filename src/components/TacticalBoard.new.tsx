import React, { useRef, useState, useEffect } from 'react';
import { 
  Circle,
  Minus,
  ArrowRight,
  Eraser,
  Undo2,
  Download,
  Palette,
  Users,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import LineupProcessor, { Player } from './LineupProcessor';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const doubleClickDelay = 300; // milliseconds
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth * 0.7;

    drawCanvas();
  }, [elements]);
  
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

    // Penalty spots
    ctx.beginPath();
    ctx.arc(margin + 88, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width - margin - 88, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Corner arcs
    ctx.beginPath();
    ctx.arc(margin, margin, 10, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width - margin, margin, 10, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(margin, canvas.height - margin, 10, 3 * Math.PI / 2, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width - margin, canvas.height - margin, 10, Math.PI, 3 * Math.PI / 2);
    ctx.stroke();

    // Draw all elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { type, x, y, name, number, color, points, controlPoint, endPoint } = element;

    switch (type) {
      case 'home':
      case 'away':
        // Draw player circle
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = color || (type === 'home' ? homeColor : awayColor);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw player number
        if (number) {
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(number, x, y);
        }

        // Draw player name below
        if (name) {
          ctx.font = `${fontStyle} ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(name, x, y + 20);
        }
        break;

      case 'ball':
        // Draw ball
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case 'line':
        if (points && points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        break;

      case 'arrow':
        if (controlPoint && endPoint) {
          // Draw arrow line
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw arrow head
          const angle = Math.atan2(endPoint.y - y, endPoint.x - x);
          const headLength = 10;
          ctx.beginPath();
          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(
            endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
            endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
            endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedTool === 'eraser') {
      setCursor('crosshair');
    } else if (selectedTool === 'line' || selectedTool === 'arrow') {
      setCursor('crosshair');
    } else {
      setCursor('default');
    }
  }, [selectedTool]);
  
  // Handle detected players from the lineup processor
  const handlePlayersDetected = (players: Player[]) => {
    setIsProcessingImage(true);

    // Create a delay to simulate processing
    setTimeout(() => {
      // Convert detected players to drawing elements
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsProcessingImage(false);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const margin = 30; // Same margin as used in drawCanvas

      // Filter out only player elements
      const nonPlayerElements = elements.filter(
        (el: DrawingElement) => el.type !== 'home' && el.type !== 'away'
      );

      const newElements: DrawingElement[] = players.map((player) => {
        return {
          type: player.type,
          x: margin + player.x * (width - 2 * margin),
          y: player.y * height,
          name: player.name,
          number: player.number,
          color: player.type === 'home' ? homeColor : awayColor
        };
      });

      setElements([...nonPlayerElements, ...newElements]);
      setIsProcessingImage(false);
    }, 1000); // 1 second delay for visual effect
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for double click on a player element
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < doubleClickDelay) {
      // Check if click is on an element
      const clickedElementIndex = elements.findIndex(el => {
        if (el.type === 'home' || el.type === 'away') {
          const distance = Math.sqrt(Math.pow(el.x - x, 2) + Math.pow(el.y - y, 2));
          return distance <= 15; // Player circle radius
        }
        return false;
      });

      if (clickedElementIndex !== -1) {
        const element = elements[clickedElementIndex];
        setEditingElementIndex(clickedElementIndex);
        setPlayerName(element.name || '');
        setPlayerNumber(element.number || '');
        setSelectedTool(element.type as 'home' | 'away');
        setShowDialog(true);
        return;
      }
    }
    setLastClickTime(currentTime);

    if (selectedTool === 'eraser') {
      // Handle eraser tool - remove elements near the click point
      const newElements = elements.filter(el => {
        const distance = Math.sqrt(Math.pow(el.x - x, 2) + Math.pow(el.y - y, 2));
        return distance > 15; // Keep elements that are far enough
      });
      setElements(newElements);
      return;
    }

    if (selectedTool === 'home' || selectedTool === 'away') {
      // Place a player
      setTempPosition({ x, y });
      setShowDialog(true);
      return;
    }

    if (selectedTool === 'ball') {
      // Place a ball
      const newElement: DrawingElement = {
        type: 'ball',
        x,
        y
      };
      setElements([...elements, newElement]);
      return;
    }

    if (selectedTool === 'line' || selectedTool === 'arrow') {
      // Start drawing a line or arrow
      setIsDrawing(true);
      const newElement: DrawingElement = {
        type: selectedTool,
        x,
        y,
        points: [{ x, y }],
        ...(selectedTool === 'arrow' && { controlPoint: { x, y }, endPoint: { x, y } })
      };
      setCurrentElement(newElement);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentElement.type === 'line' && currentElement.points) {
      // Update line points
      setCurrentElement({
        ...currentElement,
        points: [...currentElement.points, { x, y }]
      });
    } else if (currentElement.type === 'arrow') {
      // Update arrow endpoint
      setCurrentElement({
        ...currentElement,
        endPoint: { x, y }
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentElement) {
      // Add the current element to elements array
      setElements([...elements, currentElement]);
      setCurrentElement(null);
      setIsDrawing(false);
    }
  };

  const handleUndo = () => {
    if (elements.length > 0) {
      setElements(elements.slice(0, -1));
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'tactical-board.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex flex-wrap justify-around items-center gap-2 p-4 bg-white/95 rounded-lg shadow-md">
        <button
          className={`p-2 rounded-lg ${selectedTool === 'home' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setSelectedTool('home')}
          title="Home Player"
        >
          <Circle className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          className={`p-2 rounded-lg ${selectedTool === 'away' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setSelectedTool('away')}
          title="Away Player"
        >
          <Circle className="w-6 h-6" />
          <span className="text-xs mt-1">Away</span>
        </button>

        <button
          className={`p-2 rounded-lg ${selectedTool === 'ball' ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setSelectedTool('ball')}
          title="Ball"
        >
          <Circle className="w-6 h-6" fill="white" />
          <span className="text-xs mt-1">Ball</span>
        </button>

        <button
          className={`p-2 rounded-lg ${selectedTool === 'line' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setSelectedTool('line')}
          title="Line"
        >
          <Minus className="w-6 h-6" />
          <span className="text-xs mt-1">Line</span>
        </button>

        <button
          className={`p-2 rounded-lg ${selectedTool === 'arrow' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setSelectedTool('arrow')}
          title="Arrow"
        >
          <ArrowRight className="w-6 h-6" />
          <span className="text-xs mt-1">Arrow</span>
        </button>

        <button
          className={`p-2 rounded-lg ${selectedTool === 'eraser' ? 'bg-pink-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => setSelectedTool('eraser')}
          title="Eraser"
        >
          <Eraser className="w-6 h-6" />
          <span className="text-xs mt-1">Eraser</span>
        </button>

        <button
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          onClick={handleUndo}
          title="Undo"
        >
          <Undo2 className="w-6 h-6" />
          <span className="text-xs mt-1">Undo</span>
        </button>

        <button
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          onClick={handleSave}
          title="Save"
        >
          <Download className="w-6 h-6" />
          <span className="text-xs mt-1">Save</span>
        </button>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Font Size:</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Font Style:</label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="bold">Bold</option>
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
        
        <div className="ml-2">
          <LineupProcessor onPlayersDetected={handlePlayersDetected} />
        </div>
      </div>

      <div className="mt-4">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg w-full touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor }}
        />
      </div>
      
      {isProcessingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-lg font-semibold">Processing lineup image...</p>
            <p className="text-sm text-gray-600 mt-2">Extracting player positions and information</p>
          </div>
        </div>
      )}

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
                  {editingElementIndex !== null ? 'Update' : 'Add'}
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
