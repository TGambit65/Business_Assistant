"use client" // Remove if not using Next.js app router

import React, { useState } from "react"
import { Save } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

/* ---------- Button placeholder ---------- */
function Button({ onClick, children, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-2 rounded-md border transition-colors focus:outline-none 
        focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400
        hover:opacity-90
        ${className}
      `}
    >
      {children}
    </button>
  )
}

/* ---------- Input with higher contrast ---------- */
function Input(props) {
  return (
    <input
      {...props}
      className={`
        w-full rounded-md px-3 py-2
        border-2 border-gray-400
        bg-gray-50 text-black placeholder-gray-500
        shadow-md
        dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400
        focus:shadow-lg
        ${props.className || ""}
      `}
    />
  )
}

/* ---------- Textarea with higher contrast ---------- */
function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`
        w-full rounded-md px-3 py-2
        border-2 border-gray-400
        bg-gray-50 text-black placeholder-gray-500
        shadow-md
        dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400
        focus:shadow-lg
        ${props.className || ""}
      `}
    />
  )
}

/* ---------- Switch placeholder ---------- */
function Switch({ defaultChecked, id }) {
  const [checked, setChecked] = useState(!!defaultChecked)
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center cursor-pointer focus-within:outline-none 
                 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-orange-400"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="hidden"
      />
      <span
        className={`relative inline-block w-10 h-5 rounded-full transition-colors 
          ${checked ? "bg-blue-500 dark:bg-orange-500" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform 
            ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </label>
  )
}

/* ---------- Simple Tabs Implementation ---------- */
function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue || "")
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
    if (child.type === TabsList) {
      return React.cloneElement(child, { active, setActive })
    }
    if (child.type === TabsContent) {
      return child.props.value === active ? child : null
    }
    return child
  })
}
function TabsList({ active, setActive, children, className }) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, { active, setActive })
        }
        return child
      })}
    </div>
  )
}
function TabsTrigger({ value, active, setActive, children }) {
  const isActive = value === active
  return (
    <button
      className={`
        px-3 py-1 rounded-md font-medium focus:outline-none 
        focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400
        ${
          isActive
            ? "bg-blue-500 text-white dark:bg-orange-500"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
        }
      `}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  )
}
function TabsContent({ children }) {
  return <div className="mt-4">{children}</div>
}

/* ---------- MAIN SETTINGS PAGE ---------- */
export default function SettingsPage({
  isOpen,
  onClose,
  boxes,
  setBoxes,
  toggleImportant,
  handleDeleteBox,
  handleRenameBox,
  handleAddBox,
}) {
  const [isLoading, setIsLoading] = useState(false)

  // For editing boxes in "Email Boxes" tab
  const [editingBoxId, setEditingBoxId] = useState(null)
  const [tempName, setTempName] = useState("")
  const [tempInstructions, setTempInstructions] = useState("")
  const [tempKeywords, setTempKeywords] = useState("")

  if (!isOpen) return null

  const handleSaveChanges = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  // DRAG & DROP
  const handleDragEnd = (result) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return
    const newBoxes = Array.from(boxes)
    const [moved] = newBoxes.splice(result.source.index, 1)
    newBoxes.splice(result.destination.index, 0, moved)
    setBoxes(newBoxes)
  }

  // Editing a box
  const startEditing = (box) => {
    setEditingBoxId(box.id)
    setTempName(box.name)
    setTempInstructions(box.instructions || "")
    setTempKeywords(box.keywords || "")
  }

  // Save changes to a box
  const saveEdits = (boxId) => {
    handleRenameBox(boxId, tempName, tempInstructions, tempKeywords)
    setEditingBoxId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        className="
          bg-white dark:bg-[#2A2A2A]
          text-gray-800 dark:text-gray-100
          rounded-lg p-6 w-full max-w-4xl relative shadow-xl
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-2 right-2 
            text-gray-600 dark:text-gray-200
            hover:text-black dark:hover:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400
          "
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="flex justify-start space-x-2 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email-boxes">Email Boxes</TabsTrigger>
            <TabsTrigger value="keyboard-shortcuts">Keyboard Shortcuts</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="mt-4 space-y-4">
              <h2 className="text-xl font-semibold">General Settings</h2>
              <div>
                <label className="block text-gray-700 dark:text-gray-100 mb-1">Name:</label>
                <Input defaultValue="John Doe" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-100 mb-1">Email:</label>
                <Input defaultValue="john@example.com" type="email" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-100 mb-1">
                  Enable notifications:
                </label>
                <Switch defaultChecked />
              </div>
            </div>
          </TabsContent>

          {/* Email Boxes Tab */}
          <TabsContent value="email-boxes">
            <p className="text-sm mt-1 mb-2 text-gray-700 dark:text-gray-100">
              Reorder, edit, delete, or star/unstar your email boxes below.
            </p>
            <div
              style={{ maxHeight: "300px" }}
              className="overflow-y-auto border-2 border-gray-300 dark:border-gray-600 p-3 rounded-md"
            >
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="email-boxes-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {boxes.map((box, index) => (
                        <Draggable key={box.id} draggableId={box.id} index={index}>
                          {(providedInner) => (
                            <div
                              ref={providedInner.innerRef}
                              {...providedInner.draggableProps}
                              {...providedInner.dragHandleProps}
                              className="
                                p-3 border-2 border-gray-300 dark:border-gray-600 
                                rounded-md bg-gray-50 dark:bg-gray-900 
                                shadow-sm
                              "
                            >
                              {editingBoxId === box.id ? (
                                <>
                                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-100">
                                    Name:
                                  </label>
                                  <Input
                                    className="mb-1"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                  />
                                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-100">
                                    AI Instructions:
                                  </label>
                                  <Textarea
                                    className="mb-1"
                                    rows={2}
                                    value={tempInstructions}
                                    onChange={(e) => setTempInstructions(e.target.value)}
                                  />
                                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-100">
                                    Keywords:
                                  </label>
                                  <Input
                                    className="mb-1"
                                    placeholder="Keywords (comma-separated)"
                                    value={tempKeywords}
                                    onChange={(e) => setTempKeywords(e.target.value)}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      onClick={() => saveEdits(box.id)}
                                      className="text-xs bg-blue-500 dark:bg-orange-500 text-white px-2 py-1"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      onClick={() => setEditingBoxId(null)}
                                      className="text-xs bg-gray-500 text-white px-2 py-1"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium dark:text-gray-100">
                                    {box.name}
                                  </span>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => startEditing(box)}
                                      className="text-xs bg-blue-500 dark:bg-orange-500 text-white px-2 py-1"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteBox(box.id)}
                                      className="text-xs bg-red-500 text-white px-2 py-1"
                                    >
                                      Delete
                                    </Button>
                                    <Button
                                      onClick={() => toggleImportant(box.id)}
                                      className="text-xs bg-blue-500 dark:bg-orange-500 text-white px-2 py-1"
                                    >
                                      {box.important ? "Unstar" : "Star"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            <Button
              onClick={() => {
                const newBox = handleAddBox()
                setEditingBoxId(newBox.id)
                setTempName(newBox.name)
                setTempInstructions("")
                setTempKeywords("")
              }}
              className="mt-2 bg-blue-500 dark:bg-orange-500 text-white hover:bg-blue-600 dark:hover:bg-orange-600"
            >
              + Add Box
            </Button>
          </TabsContent>

          {/* Keyboard Shortcuts Tab */}
          <TabsContent value="keyboard-shortcuts">
            <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-100">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <p className="text-sm">
                Example: Configure your shortcuts here. (Adapt as needed.)
              </p>
              <div>
                <label className="block mb-1">Create New:</label>
                <Input placeholder="Ctrl+N" defaultValue="Ctrl+N" />
              </div>
              <div>
                <label className="block mb-1">Save:</label>
                <Input placeholder="Ctrl+S" defaultValue="Ctrl+S" />
              </div>
              <div>
                <label className="block mb-1">Search:</label>
                <Input placeholder="Ctrl+F" defaultValue="Ctrl+F" />
              </div>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-100">
              <h2 className="text-lg font-semibold">Privacy Settings</h2>
              <p className="text-sm">
                Example: Configure your privacy options here. (Adapt as needed.)
              </p>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <span>Allow data collection</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* "Save Changes" button at bottom */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="
              bg-blue-500 dark:bg-orange-500 text-white 
              hover:bg-blue-600 dark:hover:bg-orange-600
              focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400
            "
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="inline-block mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
