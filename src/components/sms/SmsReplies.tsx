import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, MessageCircle, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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

// Auto-response generator based on message content
const generateAutoResponse = (message: string, patientName: string): string => {
  // Extract first name for a more personal touch
  const firstName = patientName.split(' ')[0];
  
  // Extract key phrases from the message
  const lowercaseMessage = message.toLowerCase();
  
  // Booking related messages
  if (lowercaseMessage.includes('book') || 
      lowercaseMessage.includes('schedule') || 
      lowercaseMessage.includes('appointment') ||
      lowercaseMessage.includes('next week') || 
      lowercaseMessage.includes('available')) {
    
    return `Hey ${firstName}! Thanks for reaching out 👋 Absolutely, we can get you booked in! You can jump on our online booking page here: https://booking.cliniko.com/yourbusiness\n\nOr if you prefer, just let me know what days/times work best for you, and I'll sort it out. Looking forward to seeing you soon!`;
  }
  
  // Rescheduling related messages
  else if (lowercaseMessage.includes('reschedule') || 
           lowercaseMessage.includes('change appointment') ||
           lowercaseMessage.includes('move appointment')) {
    
    return `Hey ${firstName}! No worries at all about rescheduling - life happens! 😊 You can easily switch your appointment time through our booking page: https://booking.cliniko.com/yourbusiness\n\nOr just shoot me a couple of times that work better for you, and I'll get that sorted for you. Easy as!`;
  }
  
  // Thank you / positive feedback messages
  else if (lowercaseMessage.includes('thank') || 
           lowercaseMessage.includes('better') ||
           lowercaseMessage.includes('good') ||
           lowercaseMessage.includes('helped')) {
    
    return `Hey ${firstName}! That's awesome to hear! 🎉 Really stoked that you're feeling better. That's what it's all about! If you ever need another session, our booking page is here: https://booking.cliniko.com/yourbusiness\n\nBut no pressure - just keep doing those exercises we chatted about, and give me a shout if anything changes. You're crushing it!`;
  }
  
  // Pain or symptoms persisting
  else if (lowercaseMessage.includes('pain') || 
           lowercaseMessage.includes('hurt') ||
           lowercaseMessage.includes('sore') ||
           lowercaseMessage.includes('worse')) {
    
    return `Hey ${firstName}, sorry to hear you're still having some trouble! That's definitely not what we want 😕 Let's get you back in ASAP so I can take another look. You can book directly here: https://booking.cliniko.com/yourbusiness\n\nIn the meantime, try some gentle movement and the ice/heat we discussed. Hang in there - we'll get this sorted together!`;
  }
  
  // Questions about exercises
  else if (lowercaseMessage.includes('exercise') || 
           lowercaseMessage.includes('stretch') ||
           lowercaseMessage.includes('movement')) {
    
    return `Hey ${firstName}! Great question about the exercises! 💪 Happy to clarify - keep focusing on form rather than reps, and remember it shouldn't increase your pain. If you want me to check your technique, feel free to book a quick follow-up: https://booking.cliniko.com/yourbusiness\n\nKeep it up - consistency is key with these ones!`;
  }
  
  // Default response
  return `Hey ${firstName}! Thanks for your message! 😊 I'll get back to you properly soon, but if you're looking to book in, you can save time by using our online booking: https://booking.cliniko.com/yourbusiness\n\nLet me know if you need anything specific in the meantime - I'm here to help!`;
};

const SmsReplies: React.FC = () => {
  const { toast } = useToast();
  const [replies, setReplies] = useState<SmsReply[]>(mockReplies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [currentReply, setCurrentReply] = useState<SmsReply | null>(null);
  const [responseText, setResponseText] = useState('');
  const [includeBookingLink, setIncludeBookingLink] = useState(true);

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

  const openResponseDialog = (reply: SmsReply) => {
    setCurrentReply(reply);
    // Generate auto-response based on message content
    const autoResponse = generateAutoResponse(reply.message, reply.patientName);
    setResponseText(autoResponse);
    setResponseDialogOpen(true);
    
    // Mark as read when opening response dialog
    if (reply.status === 'new') {
      handleMarkAsRead(reply.id);
    }
  };

  const handleSendResponse = () => {
    if (!currentReply) return;

    // In a real app, this would send the message through an SMS API
    setReplies(prev => 
      prev.map(reply => 
        reply.id === currentReply.id ? { ...reply, status: 'responded' } : reply
      )
    );
    
    toast({
      title: "Response sent",
      description: `Your response to ${currentReply.patientName} has been sent.`,
    });
    
    setResponseDialogOpen(false);
    setCurrentReply(null);
  };

  const handleAddBookingLink = () => {
    if (includeBookingLink) {
      setResponseText(prev => prev + "\n\nBook online: https://booking.cliniko.com/yourbusiness");
    }
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
                                onClick={() => openResponseDialog(reply)}
                                className="flex items-center gap-2"
                              >
                                <span>Auto-respond</span>
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

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Auto-generated Response</DialogTitle>
            <DialogDescription>
              Review and edit the auto-generated response for {currentReply?.patientName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-gray-50 p-4 text-sm mb-2">
              <div className="font-medium mb-1">Original message:</div>
              <div className="text-muted-foreground">{currentReply?.message}</div>
            </div>

            <Textarea 
              value={responseText} 
              onChange={(e) => setResponseText(e.target.value)} 
              rows={6}
              className="resize-none"
              placeholder="Your response"
            />

            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setIncludeBookingLink(prev => !prev);
                  handleAddBookingLink();
                }}
              >
                <Calendar className="h-4 w-4" />
                <span>Include Booking Link</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendResponse} type="submit">
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
