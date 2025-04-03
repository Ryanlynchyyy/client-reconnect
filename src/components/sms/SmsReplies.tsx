
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface SmsReply {
  id: string;
  patientId: number;
  patientName: string;
  message: string;
  receivedAt: string;
  status: 'new' | 'read' | 'responded';
  phone: string;
}

const mockReplies: SmsReply[] = [
  {
    id: 'reply1',
    patientId: 101,
    patientName: 'Emma Wilson',
    message: 'Yes, I would like to book a follow-up appointment for next week.',
    receivedAt: '2023-11-15T09:30:00',
    status: 'new',
    phone: '0412 345 678'
  },
  {
    id: 'reply2',
    patientId: 102,
    patientName: 'Michael Brown',
    message: 'Thanks for checking in. I\'m feeling much better now, but I\'ll schedule an appointment if needed.',
    receivedAt: '2023-11-14T16:45:00',
    status: 'read',
    phone: '0423 456 789'
  },
  {
    id: 'reply3',
    patientId: 103,
    patientName: 'Sophia Johnson',
    message: 'Can I book for Thursday afternoon?',
    receivedAt: '2023-11-14T11:20:00',
    status: 'responded',
    phone: '0434 567 890'
  },
  {
    id: 'reply4',
    patientId: 104,
    patientName: 'James Davis',
    message: 'I need to reschedule my appointment from Friday. Is Monday available?',
    receivedAt: '2023-11-13T14:15:00',
    status: 'new',
    phone: '0445 678 901'
  },
  {
    id: 'reply5',
    patientId: 105,
    patientName: 'Olivia Taylor',
    message: 'My shoulder is feeling much better after our sessions. Thank you!',
    receivedAt: '2023-11-12T10:05:00',
    status: 'read',
    phone: '0456 789 012'
  }
];

const SmsReplies: React.FC = () => {
  const { toast } = useToast();
  const [replies, setReplies] = useState<SmsReply[]>(mockReplies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>("all");
  
  const filteredReplies = replies.filter(reply => {
    const matchesSearch = !searchTerm || 
      reply.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reply.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reply.phone.includes(searchTerm);
    
    const matchesStatus = selectedTab === "all" || reply.status === selectedTab;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    // In a real application, this would fetch new replies from the API
    toast({
      title: "Refreshed",
      description: "The latest messages have been loaded.",
    });
  };

  const handleMarkAsRead = (replyId: string) => {
    setReplies(prev => 
      prev.map(reply => 
        reply.id === replyId ? { ...reply, status: 'read' } : reply
      )
    );
    
    toast({
      title: "Marked as read",
      description: "The message has been marked as read.",
    });
  };

  const handleRespond = (replyId: string, patientName: string) => {
    // In a real app, this would open a compose message dialog
    setReplies(prev => 
      prev.map(reply => 
        reply.id === replyId ? { ...reply, status: 'responded' } : reply
      )
    );
    
    toast({
      title: "Response sent",
      description: `Your response to ${patientName} has been sent.`,
    });
  };

  const getStatusCount = (status: string) => {
    return replies.filter(r => status === "all" ? true : r.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Replies</h1>
          <p className="text-muted-foreground">
            Manage patient responses to your follow-up messages
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh}
          variant="outline" 
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              New Replies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-800">
              {replies.filter(r => r.status === 'new').length}
            </div>
            <p className="text-amber-700 text-sm">Unread patient messages</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">
              {replies.filter(r => r.status === 'read').length}
            </div>
            <p className="text-blue-700 text-sm">Messages you've seen</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Responded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">
              {replies.filter(r => r.status === 'responded').length}
            </div>
            <p className="text-green-700 text-sm">Messages you've replied to</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Inbox</CardTitle>
          <CardDescription>View and respond to patient messages</CardDescription>
          
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-1">
                All
                <Badge variant="secondary">{getStatusCount('all')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1">
                New
                <Badge variant="secondary">{getStatusCount('new')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-1">
                Read
                <Badge variant="secondary">{getStatusCount('read')}</Badge>
              </TabsTrigger>
              <TabsTrigger value="responded" className="flex items-center gap-1">
                Responded
                <Badge variant="secondary">{getStatusCount('responded')}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              <div className="space-y-4">
                {filteredReplies.length > 0 ? (
                  filteredReplies.map((reply) => (
                    <Card key={reply.id} className={`overflow-hidden ${
                      reply.status === 'new' ? 'border-l-4 border-l-amber-500' : 
                      reply.status === 'read' ? 'border-l-4 border-l-blue-500' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-grow">
                            <Avatar className="h-10 w-10 mt-1">
                              <AvatarFallback>{reply.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.patientName}`} />
                            </Avatar>
                            
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                <div className="font-medium flex items-center gap-2">
                                  <Link to={`/patients?id=${reply.patientId}`} className="hover:underline">
                                    {reply.patientName}
                                  </Link>
                                  {reply.status === 'new' && (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(reply.receivedAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-sm mb-3">{reply.message}</div>
                              <div className="text-xs text-muted-foreground">{reply.phone}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {reply.status === 'new' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMarkAsRead(reply.id)}
                              >
                                Mark Read
                              </Button>
                            )}
                            {reply.status !== 'responded' && (
                              <Button 
                                size="sm"
                                onClick={() => handleRespond(reply.id, reply.patientName)}
                              >
                                Respond
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages found matching your criteria
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon: SMS Integration</CardTitle>
          <CardDescription>
            Integration with Twilio or another SMS provider will be added soon to enable real-time
            message handling. Currently showing example data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            In the future, this page will display actual SMS replies from your patients. You'll be able to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-muted-foreground">
            <li>Receive and view real-time SMS responses</li>
            <li>Reply directly from this interface</li>
            <li>Automatically link conversations to patient records</li>
            <li>Get notifications for new messages</li>
          </ul>
          <div className="mt-4">
            <Link to="/sms">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to SMS Templates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsReplies;
