/**
 * Monitoring Dashboard Component
 * Displays system health, performance metrics, and alerts
 */
import { useState, useEffect } from 'react';
import { Card, Button, Progress, Badge } from '@/components/ui';
import { healthMonitor, analyticsService } from '@/services';
import { ActivityIcon, CheckCircleIcon, AlertTriangleIcon } from '@/components/icons';

export const MonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState(healthMonitor.getSystemHealth());
  const [systemMetrics, setSystemMetrics] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState(healthMonitor.getActiveAlerts());
  const [timeRange, setTimeRange] = useState<'hour' | 'day'>('day');
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      loadMonitoringData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  // Load initial data
  useEffect(() => {
    loadMonitoringData();
  }, [timeRange]);

  const loadMonitoringData = async () => {
    setRefreshing(true);
    try {
      const [health, sysMetrics, perfMetrics] = await Promise.all([
        healthMonitor.getSystemHealth(),
        analyticsService.getSystemMetrics(timeRange),
        analyticsService.getPerformanceMetrics(timeRange === 'hour' ? 'hour' : 'day'),
      ]);

      setSystemHealth(health);
      setSystemMetrics(sysMetrics);
      setPerformanceMetrics(perfMetrics);
      setAlerts(healthMonitor.getActiveAlerts());
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    healthMonitor.acknowledgeAlert(alertId);
    setAlerts(healthMonitor.getActiveAlerts());
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <ActivityIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">System Monitoring</h3>
            <p className="text-sm text-gray-600">Real-time system health and performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'hour' | 'day')}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="hour">Last Hour</option>
              <option value="day">Last 24 Hours</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={loadMonitoringData}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-medium">System Health</h4>
            <Badge className={getHealthBgColor(systemHealth.overall)}>
              {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Health Score</p>
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.overall)}`}>
                {systemHealth.score.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Uptime</p>
              <div className="text-2xl font-bold text-green-600">
                {systemHealth.uptime.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
              <div className={`text-2xl font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {alerts.length}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Last Check</p>
              <span className="text-sm text-gray-500">
                {new Date(systemHealth.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Health Checks */}
          <div className="space-y-3">
            <h5 className="font-medium">Service Status</h5>
            <div className="grid md:grid-cols-2 gap-4">
              {systemHealth.checks.map((check) => (
                <div key={check.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    {check.status === 'healthy' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    {check.status === 'degraded' && <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />}
                    {check.status === 'unhealthy' && <AlertTriangleIcon className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-gray-600">{check.responseTime}ms</p>
                    </div>
                  </div>
                  <Badge className={getHealthBgColor(check.status)}>
                    {check.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Active Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Active Alerts</h4>
          {alerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {alerts.length} Active
            </Badge>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No active alerts</p>
            <p className="text-sm text-gray-500">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <p className="font-medium">{alert.message}</p>
                    </div>
                    <p className="text-sm opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                    {alert.acknowledged && (
                      <p className="text-xs mt-1 opacity-75">Acknowledged</p>
                    )}
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Performance Metrics</h4>

        <div className="grid md:grid-cols-2 gap-6">
          {/* System Metrics */}
          <div>
            <h5 className="font-medium mb-3">System Activity</h5>
            <div className="space-y-3">
              {systemMetrics.slice(-6).map((metric, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </span>
                  <span>{metric.activeUsers} users</span>
                </div>
              ))}
            </div>
          </div>

          {/* Response Times */}
          <div>
            <h5 className="font-medium mb-3">Response Times</h5>
            <div className="space-y-3">
              {performanceMetrics.slice(-6).map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                    <span>{metric.pageLoadTime.toFixed(0)}ms</span>
                  </div>
                  <Progress
                    value={Math.min(100, (metric.pageLoadTime / 2000) * 100)}
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => {/* Run health check */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <CheckCircleIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Run Health Check</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* View logs */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <ActivityIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">View Logs</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Performance test */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <AlertTriangleIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Performance Test</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* System diagnostics */}}
            className="h-auto py-3"
          >
            <div className="text-center">
              <ActivityIcon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">Diagnostics</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};