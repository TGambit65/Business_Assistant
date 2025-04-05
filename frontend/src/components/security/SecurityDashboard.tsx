import React, { useState, useEffect } from 'react';
import { 
  securityManager, 
  auditLogger, 
  twoFactorAuth, 
  mobileSecurity, 
  securityTesting 
} from '../../security';
import { 
  AuditResult, 
  ComplianceRule, 
  SecurityTestResult 
} from '../../types/security';
import { EventType } from '../../security/AuditLogger';

/**
 * SecurityDashboard component
 * 
 * Displays comprehensive security status including:
 * - Security score
 * - Audit findings
 * - Compliance status
 * - Recent security events
 */
const SecurityDashboard: React.FC = () => {
  // State for security audit results
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  
  // Fetch security data on component mount
  useEffect(() => {
    fetchSecurityData();
  }, []);
  
  // Fetch all security data
  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Fetch security audit result
      const result = await securityManager.performSecurityAudit();
      setAuditResult(result);
      
      // Fetch test results
      const tests = await securityTesting.runAllTests();
      setTestResults(tests);
      
      // Fetch compliance rules
      const rules = securityManager.getSecurityConfig().compliance;
      setComplianceRules(rules);
      
      // Fetch recent security events
      const events = auditLogger.getEvents({
        fromTimestamp: Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
      });
      setRecentEvents(events);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Run a specific security test
  const runSecurityTest = async (testName: string) => {
    setLoading(true);
    try {
      let result: SecurityTestResult | null = null;
      
      // Determine which test to run based on the name
      switch (testName) {
        case 'xss':
          result = await securityTesting.testXSSProtection();
          break;
        case 'csrf':
          result = await securityTesting.testCSRFProtection();
          break;
        case 'storage':
          result = await securityTesting.testSecureStorage();
          break;
        default:
          console.warn(`Unknown test: ${testName}`);
          return;
      }
      
      // Update the test results
      if (result) {
        setTestResults(prev => {
          const index = prev.findIndex(t => t.name === result!.name);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = result!;
            return updated;
          }
          return [...prev, result!];
        });
      }
    } catch (error) {
      console.error(`Error running security test ${testName}:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle enforcement of a compliance rule
  const toggleComplianceRule = (ruleId: string, enforced: boolean) => {
    try {
      const rule = complianceRules.find(r => r.id === ruleId);
      if (rule) {
        rule.enforced = enforced;
        securityManager.enforceCompliance([rule]);
        
        // Update the local state
        setComplianceRules(prev => {
          const updated = [...prev];
          const index = updated.findIndex(r => r.id === ruleId);
          if (index >= 0) {
            updated[index] = { ...updated[index], enforced };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error(`Error toggling compliance rule ${ruleId}:`, error);
    }
  };
  
  // Format a timestamp as a readable date string
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get color based on severity
  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-400';
      case 'low':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };
  
  // Get color based on whether a test passed
  const getTestResultColor = (passed: boolean): string => {
    return passed ? 'bg-green-500' : 'bg-red-500';
  };
  
  // Render the overview tab
  const renderOverview = () => {
    if (!auditResult) {
      return <div className="text-center py-8">No audit data available</div>;
    }
    
    return (
      <div className="space-y-6">
        {/* Security Score */}
        <div className="bg-background rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Security Score</h3>
          <div className="flex items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={auditResult.score > 80 ? '#4CAF50' : auditResult.score > 60 ? '#FF9800' : '#F44336'}
                  strokeWidth="3"
                  strokeDasharray={`${auditResult.score}, 100`}
                  strokeLinecap="round"
                />
                <text x="18" y="20.5" className="text-lg font-bold" textAnchor="middle">
                  {auditResult.score}%
                </text>
              </svg>
            </div>
            <div className="ml-6">
              <p className="text-gray-600">{auditResult.summary}</p>
              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-red-600 font-bold">{auditResult.vulnerabilities.critical}</div>
                  <div className="text-sm text-gray-500">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-500 font-bold">{auditResult.vulnerabilities.high}</div>
                  <div className="text-sm text-gray-500">High</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">{auditResult.vulnerabilities.medium}</div>
                  <div className="text-sm text-gray-500">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{auditResult.vulnerabilities.low}</div>
                  <div className="text-sm text-gray-500">Low</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Security Events */}
        <div className="bg-background rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Security Events</h3>
          {recentEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-gray-200">
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.timestamp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{event.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                          event.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{event.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent security events</p>
          )}
        </div>
        
        {/* Security Recommendations */}
        <div className="bg-background rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Security Recommendations</h3>
          {auditResult.recommendations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {auditResult.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-600">{recommendation}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recommendations available</p>
          )}
        </div>
      </div>
    );
  };
  
  // Render the audit findings tab
  const renderAuditFindings = () => {
    if (!auditResult) {
      return <div className="text-center py-8">No audit data available</div>;
    }
    
    return (
      <div className="bg-background rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">Security Audit Findings</h3>
          <p className="text-sm text-gray-500">Last updated: {formatDate(auditResult.timestamp)}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remediation</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {auditResult.findings.length > 0 ? (
                auditResult.findings.map((finding, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(finding.severity)} text-white`}>
                        {finding.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{finding.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{finding.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{finding.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{finding.remediation}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No findings detected. Great job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render the compliance tab
  const renderCompliance = () => {
    return (
      <div className="bg-background rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold">Compliance Rules</h3>
          <p className="text-sm text-gray-500">Manage and enforce compliance standards</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-200">
              {complianceRules.length > 0 ? (
                complianceRules.map((rule, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{rule.name}</div>
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.standard}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(rule.severity)} text-white`}>
                        {rule.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rule.enforced ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enforced ? 'ENFORCED' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleComplianceRule(rule.id, !rule.enforced)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          rule.enforced
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {rule.enforced ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No compliance rules configured
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render the security tests tab
  const renderSecurityTests = () => {
    return (
      <div className="space-y-6">
        <div className="bg-background rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Run Security Tests</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => runSecurityTest('xss')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Test XSS Protection
            </button>
            <button
              onClick={() => runSecurityTest('csrf')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Test CSRF Protection
            </button>
            <button
              onClick={() => runSecurityTest('storage')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Test Secure Storage
            </button>
          </div>
        </div>
        
        <div className="bg-background rounded-lg shadow">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold">Test Results</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {testResults.length > 0 ? (
                  testResults.map((test, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{test.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTestResultColor(test.passed)} text-white`}>
                          {test.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{test.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{test.details}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(test.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No test results available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground">Security Dashboard</h2>
        <button
          onClick={fetchSecurityData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`${
              activeTab === 'findings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Audit Findings
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Compliance
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`${
              activeTab === 'tests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security Tests
          </button>
        </nav>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Tab content */}
      {!loading && (
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'findings' && renderAuditFindings()}
          {activeTab === 'compliance' && renderCompliance()}
          {activeTab === 'tests' && renderSecurityTests()}
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
