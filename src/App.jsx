import React, { useState } from 'react'
import { Users, BookOpen, Menu } from 'lucide-react'
import StudentPairingPage from './components/StudentPairingPage'
import PDFLessonSummaryPage from './components/PDFLessonSummaryPage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('pairing')

  const tabs = [
    {
      id: 'pairing',
      name: 'Student Pairing',
      icon: Users,
      component: StudentPairingPage,
      description: 'Upload result sheets and generate AI-powered student pairs'
    },
    {
      id: 'summaries',
      name: 'Lesson Summaries',
      icon: BookOpen,
      component: PDFLessonSummaryPage,
      description: 'Upload PDF books and generate grade-appropriate lesson summaries'
    }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="App">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Menu className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Peer Learning Platform</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Description */}
          <div className="pb-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </nav>

      {/* Active Component */}
      <div className="min-h-screen">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}

export default App
