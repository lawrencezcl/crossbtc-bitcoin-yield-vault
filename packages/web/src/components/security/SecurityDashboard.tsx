/**
 * Security Dashboard Component
 * Displays security metrics, risks, and alerts
 */
import { useState, useEffect } from 'react';
import { Card, Button, Progress, Badge } from '@/components/ui';
import { securityManager, riskAnalyzer, SecurityMetrics, RiskAssessment } from '@/services/security';
import { ShieldIcon, AlertTriangleIcon, CheckCircleIcon } from '@/components/icons';

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [alerts, setAlerts] = useState(securityManager.getUnacknowledgedAlerts());
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSecurityData();
  }, []);

  // Auto-refresh alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(securityManager.getUnacknowledgedAlerts());
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    setRefreshing(true);
    try {
      const [securityMetrics, riskData] = await Promise.all([
        securityManager.getMetrics() || securityManager.runSecurityAssessment(),
        riskAnalyzer.performRiskAssessment(),
      ]);

      setMetrics(securityMetrics);
      setRiskAssessment(riskData);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    securityManager.acknowledgeAlert(alertId);
    setAlerts(securityManager.getUnacknowledgedAlerts());
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'very_low': return 'text-green-600';
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very_high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">Security Dashboard</h3>
            <p className="text-sm text-gray-600">Monitor security metrics and risks</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadSecurityData}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Security Score Overview */}
      {metrics && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-medium">Security Score</h4>
            <div className={`text-2xl font-bold ${getRiskLevelColor(metrics.riskLevel)}`}>
              {metrics.overallScore}/100
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Risk Level</p>
              <Badge className={getRiskLevelColor(metrics.riskLevel)}>
                {metrics.riskLevel.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Smart Contract</p>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium">
                  {(100 - metrics.smartContractRisk).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Last Assessment</p>
              <span className="text-xs text-gray-500">
                {new Date(metrics.lastAssessment).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="space-y-3">
            <h5 className="font-medium">Risk Breakdown</h5>
            {[
              { name: 'Smart Contract Risk', value: metrics.smartContractRisk },
              { name: 'Market Risk', value: metrics.marketRisk },
              { name: 'Liquidation Risk', value: metrics.liquidationRisk },
              { name: 'Counterparty Risk', value: metrics.counterpartyRisk },
              { name: 'Operational Risk', value: metrics.operationalRisk },
            ].map((risk) => (
              <div key={risk.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{risk.name}</span>
                  <span>{risk.value.toFixed(1)}%</span>
                </div>
                <Progress
                  value={risk.value}
                  className={`h-2 ${
                    risk.value > 30 ? 'bg-red-100' :
                    risk.value > 20 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <Card className="p-6">
          <h4 className="font-medium mb-4">Risk Assessment</h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <div>
              <h5 className="font-medium mb-3">Risk Factors</h5>
              <div className="space-y-2">
                {riskAssessment.factors.slice(0, 4).map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{factor.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{factor.category.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">
                          {(factor.currentValue * 100).toFixed(1)}%
                        </span>
                        {factor.trend === 'improving' && <span className="text-green-500 text-xs">↓</span>}
                        {factor.trend === 'deteriorating' && <span className="text-red-500 text-xs">↑</span>}
                        {factor.trend === 'stable' && <span className="text-gray-500 text-xs">→</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h5 className="font-medium mb-3">Recommendations</h5>
              <div className="space-y-2">
                {riskAssessment.recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-2 bg-blue-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                      </div>
                      <Badge
                        className={`ml-2 ${
                          rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Security Alerts</h4>
          {alerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {alerts.length} Active
            </Badge>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No security alerts</p>
            <p className="text-sm text-gray-500">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <p className="font-medium">{alert.title}</p>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Security Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => {/* Run security scan */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <ShieldIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Run Scan</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* View risk report */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <AlertTriangleIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Risk Report</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Security settings */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <ShieldIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Settings</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* View audit log */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <CheckCircleIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Audit Log</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};