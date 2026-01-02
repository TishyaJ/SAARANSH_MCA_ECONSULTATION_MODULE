import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Eye, Edit, Trash2, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";

const Authorizations = () => {
  const [permissions] = useState([
    {
      id: 1,
      name: "Consultation Management",
      description: "Create, edit, and manage e-consultation processes",
      status: "active",
      grantedDate: "2023-06-15",
      level: "full"
    },
    {
      id: 2,
      name: "Analytics Dashboard",
      description: "Access to advanced analytics and reporting features",
      status: "active",
      grantedDate: "2023-06-15",
      level: "read"
    },
    {
      id: 3,
      name: "User Management",
      description: "Manage user accounts and permissions",
      status: "pending",
      grantedDate: "2024-01-10",
      level: "limited"
    },
    {
      id: 4,
      name: "System Administration",
      description: "Full system administration capabilities",
      status: "denied",
      grantedDate: "2024-02-01",
      level: "none"
    }
  ]);

  const [apiKeys] = useState([
    {
      id: 1,
      name: "Analytics API Key",
      description: "Access to analytics and reporting APIs",
      created: "2024-01-15",
      lastUsed: "2024-09-28",
      status: "active"
    },
    {
      id: 2,
      name: "Consultation API Key",
      description: "Read-only access to consultation data",
      created: "2024-03-10",
      lastUsed: "2024-09-25",
      status: "active"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'full':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Full Access</Badge>;
      case 'read':
        return <Badge variant="outline">Read Only</Badge>;
      case 'limited':
        return <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200">Limited</Badge>;
      default:
        return <Badge variant="secondary">No Access</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Authorizations & Permissions</h1>
          <p className="text-slate-600">Manage your access permissions and API keys</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Request Permission
        </Button>
      </div>

      {/* System Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            System Permissions
          </CardTitle>
          <CardDescription>
            Your current access levels for different system functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(permission.status)}
                  <div>
                    <h3 className="font-semibold text-slate-800">{permission.name}</h3>
                    <p className="text-sm text-slate-600">{permission.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Granted on {new Date(permission.grantedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(permission.status)}
                  {getLevelBadge(permission.level)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage your API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Key className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{key.name}</h3>
                    <p className="text-sm text-slate-600">{key.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                      <span>Created: {new Date(key.created).toLocaleDateString()}</span>
                      <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(key.status)}
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Generate New API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle>Security Information</CardTitle>
          <CardDescription>Important security guidelines and best practices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">API Key Security</h4>
              <p className="text-sm text-blue-700">
                Keep your API keys secure and never share them in public repositories or client-side code.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Permission Requests</h4>
              <p className="text-sm text-green-700">
                All permission requests are reviewed by the system administrator within 24-48 hours.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Access Monitoring</h4>
              <p className="text-sm text-yellow-700">
                All API calls and system access are logged for security and audit purposes.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Regular Reviews</h4>
              <p className="text-sm text-purple-700">
                Permissions are reviewed quarterly to ensure appropriate access levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Authorizations;